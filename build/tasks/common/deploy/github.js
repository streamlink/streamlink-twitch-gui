const HTTPS = require( "https" );
const PATH = require( "path" );
const FS = require( "fs" );
const { Readable } = require( "stream" );


/**
 * @param {Object} req
 * @param {(string|Object|stream.Readable)?} data
 * @returns {Promise<{resp: http.ServerResponse, json: Object}>}
 */
function request( req, data ) {
	return new Promise( ( resolve, reject ) => {
		const request = HTTPS.request( req, resp => {
			const buffer = [];
			resp.on( "data", d => buffer.push( d ) );
			resp.on( "end", () => resolve({
				resp,
				json: JSON.parse( buffer.join( "" ) )
			}) );
		});
		request.on( "error", reject );

		if ( data instanceof Readable ) {
			data.pipe( request );

		} else {
			if ( data ) {
				request.write( typeof data === "string"
					? data
					: JSON.stringify( data )
				);
			}
			request.end();
		}
	});
}


module.exports = async function( grunt, files, options, dryRun ) {
	const { apikey, repo, tag_name } = options;

	if ( !apikey && !dryRun ) {
		throw new Error( "Missing api_key" );
	} else if ( !repo ) {
		throw new Error( "Missing repo name" );
	} else if ( !tag_name ) {
		throw new Error( "Missing tag name" );
	}

	const release = `Github release ${repo}#${tag_name}`;

	async function githubApiCall( req = {}, data = null, throwOnError = true ) {
		req.method = req.method || "GET";
		req.hostname = req.hostname || "api.github.com";
		req.headers = Object.assign( req.headers || {}, {
			"Accept": "application/vnd.github.v3+json",
			"User-Agent": repo,
			"Authorization": `token ${apikey}`
		});

		const { resp, json } = await request( req, data );
		if ( throwOnError && resp.statusCode < 200 && resp.statusCode >= 300 ) {
			throw new Error( `${resp.statusCode}: ${resp.statusMessage}` );
		}

		return json;
	}

	async function getReleaseId() {
		try {
			const { id } = await githubApiCall({
				path: `/repos/${repo}/releases/tags/${tag_name}`
			});
			return id;

		} catch ( e ) {
			return null;
		}
	}

	async function getBody() {
		const content = ( await FS.promises.readFile( options.body ) ).toString();
		const data = Object.assign( {}, options.template );
		for ( const [ key, value ] of Object.entries( data ) ) {
			data[ key ] = grunt.config.process( value );
		}

		return grunt.template.process( content, { data } );
	}

	async function getDistFileStreams() {
		const streams = new Map();
		for ( const file of files.sort() ) {
			const basename = PATH.basename( file );
			const stats = await FS.promises.stat( file );
			if ( !stats.isFile() || stats.mode & 0o444 === 0 ) { continue; }
			streams.set( basename, {
				file,
				size: stats.size,
				stream: FS.createReadStream( file )
			});
		}

		return streams;
	}

	const body = await getBody();
	const payload = {
		name: tag_name,
		tag_name,
		body
	};
	grunt.log.debug( JSON.stringify( payload ) );

	let id = await getReleaseId();
	if ( !id ) {
		if ( dryRun ) {
			grunt.log.ok( `Would have created ${release}` );
		} else {
			const resp = await githubApiCall({
				method: "POST",
				path: `/repos/${repo}/releases`
			}, payload );
			id = resp.id;
			grunt.log.ok( `Created ${release} with ID ${id}` );
		}
	} else {
		if ( dryRun ) {
			grunt.log.ok( `Would have updated ${release}` );
		} else {
			await githubApiCall({
				method: "PATCH",
				path: `/repos/${repo}/releases`
			}, payload );
			grunt.log.ok( `Updated ${release} with ID ${id}` );
		}
	}

	for ( const [ file, { file: fullpath, size, stream } ] of await getDistFileStreams() ) {
		grunt.log.debug( JSON.stringify({ file: fullpath, size }) );
		if ( dryRun ) {
			grunt.log.ok( `Would have uploaded '${file}' to ${release}` );
		} else {
			const name = encodeURIComponent( file );
			grunt.log.ok( `Uploading '${file}' to ${release}...` );
			await githubApiCall({
				method: "POST",
				hostname: "uploads.github.com",
				path: `/repos/${repo}/releases/${id}/assets?name=${name}`,
				headers: {
					"Content-Length": size,
					"Content-Type": "application/octet-stream"
				}
			}, stream );
			grunt.log.ok( `Uploaded '${file}' to ${release}` );
		}
	}
};
