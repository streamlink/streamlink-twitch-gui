var download = require( "./download" );


/**
 * Read the checksums file from the github releases and parse it.
 * @param {Object} options
 * @param {Object} packageJSON
 * @returns {Promise<Object>}
 */
function getReleaseChecksums( options, packageJSON ) {
	var version = packageJSON.version;
	var reChecksumsFile = /-checksums\.txt$/;

	// fetch release data
	return download( options.githubReleases )
		// parse it
		.then( JSON.parse )
		// find the matching release
		.then(function( releases ) {
			var release = releases.find(function( release ) {
				return /^v?(\S+)$/.exec( release[ "tag_name" ] )[1] === version;
			});

			if ( !release || !release.assets ) {
				throw new Error( "Release " + version + " not found on Github!" );
			}

			return release;
		})
		// find the matching checksums file
		.then(function( release ) {
			var file = release.assets.find(function( file ) {
				return file[ "state" ] === "uploaded"
				    && reChecksumsFile.test( file[ "name" ] );
			});

			if ( !file || !file.hasOwnProperty( "browser_download_url" ) ) {
				throw new Error( "Missing checksums file in release " + version );
			}

			return file[ "browser_download_url" ];
		})
		// download checksums file
		.then( download )
		// parse it
		.then(function( checksums ) {
			// 1: hash
			// 2: file
			// 3: platform (eg. linux64)
			var reLine = /^([a-z0-9]+)  (\S+-([^-.]+)(?:\.[a-z]+)+)$/i;

			return checksums
				.split( "\n" )
				.map(function( line ) {
					return reLine.exec( line );
				})
				.filter(function( match ) {
					return !!match;
				})
				.reduce(function( obj, match ) {
					obj[ match[ 3 ] ] = {
						hash: match[ 1 ],
						file: match[ 2 ]
					};
					return obj;
				}, {} );
		});
}


module.exports = getReleaseChecksums;
