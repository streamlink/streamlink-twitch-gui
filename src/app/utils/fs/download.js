define([
	"utils/fs/stat",
	"utils/fs/mkdirp",
	"commonjs!path",
	"commonjs!fs",
	"commonjs!http",
	"commonjs!https"
], function(
	stat,
	mkdirp,
	PATH,
	FS,
	HTTP,
	HTTPS
) {

	var re_scheme = /^(?:http(s)?):\/\/(?:.*\/)+([^\/]+)?$/i;

	function isDirectory( stat ) {
		return stat.isDirectory();
	}


	return function download( url, dir, name ) {
		var match = re_scheme.exec( url );
		if ( !dir || !match || !match[2] ) { return Promise.reject(); }

		// if name is not set, use the remote path as file name
		var dest = PATH.join( dir, name || match[2] || "download" );

		// check if the file already exists
		return stat( dest )
			// file does not exist
			.catch(function() {
				// check if the directory exists
				return stat( dir, isDirectory )
					// try to create directory
					.catch( mkdirp.bind( null, dir ) )
					// now start the download
					.then(function() {
						var defer = Promise.defer(),
						    write = FS.createWriteStream( dest );

						write.on( "error", function() {
							write.close( defer.reject );
						});
						write.on( "finish", function() {
							write.close( defer.resolve.bind( null, dest ) );
						});

						// start the download via https or http depending on the url scheme
						( match[1] ? HTTPS : HTTP ).get( url, function( response ) {
							response.pipe( write );
						}).on( "error", defer.reject );

						return defer.promise;
					});
			});
	};

});
