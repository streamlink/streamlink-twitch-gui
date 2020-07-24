const hash = require( "../common/hash" );
const githubApi = require( "../common/github-api" );
const fetch = require( "node-fetch" );
const { createWriteStream, promises: { mkdir, stat } } = require( "fs" );
const { resolve: r } = require( "path" );


module.exports = function( grunt ) {
	async function appImageKit() {
		const { source, version, path, files } = this.options();

		// create directory
		await mkdir( path, { recursive: true } );

		// check which files are missing
		const missing = [];
		for ( const file of Object.keys( files ) ) {
			try {
				await stat( r( path, file ) );
			} catch {
				missing.push( file );
			}
		}

		// download missing files
		if ( missing.length ) {
			const githubApiCall = githubApi();
			const { assets } = await githubApiCall( `/repos/${source}/releases/tags/${version}` );
			if ( !Array.isArray( assets ) ) {
				throw new Error( "Invalid Github API response" );
			}

			const downloads = assets
				.filter( ({ name }) => missing.includes( name ) )
				.map( ({ name, browser_download_url }) => fetch( browser_download_url )
					.then( resp => new Promise( ( resolve, reject ) => {
						grunt.log.writeln( `Downloading: ${name}` );
						const stream = createWriteStream( r( path, name ), {
							mode: 0o777
						});
						stream.on( "error", reject );
						stream.on( "finish", resolve );
						resp.body.pipe( stream );
					}) )
					.then( () => grunt.log.ok( `Successfully downloaded: ${name}` ) )
				);

			await Promise.all( downloads );
		}

		// finally compare checksums and validate
		for ( const [ file, checksum ] of Object.entries( files ) ) {
			const data = await hash( r( path, file ) );
			if ( data !== checksum ) {
				throw new Error( `Invalid checksum for: ${file}` );
			}
		}

		grunt.log.ok( "All files successfully validated" );
	}

	grunt.registerTask( "appimagekit", function() {
		const done = this.async();

		appImageKit.call( this )
			.then( done, grunt.fail.fatal );
	});
};
