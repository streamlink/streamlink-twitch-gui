const githubApi = require( "../github-api" );
const PATH = require( "path" );
const FS = require( "fs" );


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
	const githubApiCall = githubApi( repo, apikey );

	async function getReleaseId() {
		try {
			const { id } = await githubApiCall( `/repos/${repo}/releases/tags/${tag_name}` );
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
	const payload = JSON.stringify({
		name: tag_name,
		tag_name,
		body
	});
	grunt.log.debug( payload );

	let id = await getReleaseId();
	if ( !id ) {
		if ( dryRun ) {
			grunt.log.ok( `Would have created ${release}` );
		} else {
			const resp = await githubApiCall( `/repos/${repo}/releases`, {
				method: "POST",
				body: payload
			});
			id = resp.id;
			grunt.log.ok( `Created ${release} with ID ${id}` );
		}
	} else {
		if ( dryRun ) {
			grunt.log.ok( `Would have updated ${release}` );
		} else {
			await githubApiCall( `/repos/${repo}/releases`, {
				method: "PATCH",
				body: payload
			});
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
			await githubApiCall( `/repos/${repo}/releases/${id}/assets?name=${name}`, {
				method: "POST",
				headers: {
					"Content-Length": size,
					"Content-Type": "application/octet-stream"
				},
				body: stream
			}, "uploads" );
			grunt.log.ok( `Uploaded '${file}' to ${release}` );
		}
	}
};
