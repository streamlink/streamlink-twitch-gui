define( [ "utils/stat" ], function( stat ) {

	var PATH = require( "path" ),
	    FS   = require( "fs" );


	function mkdir( dir ) {
		var defer = Promise.defer();

		FS.mkdir( dir, function( err ) {
			if ( err ) {
				defer.reject( err );
			} else {
				defer.resolve( dir );
			}
		});

		return defer.promise;
	}

	function isDirectory( stat ) {
		return stat.isDirectory();
	}


	// simplified and promisified version of node-mkdirp
	// https://github.com/substack/node-mkdirp
	return function mkdirp( dir ) {
		return mkdir( dir )
			.catch(function( err ) {
				if ( err && err.code === "ENOENT" ) {
					// recursively try to create the parent folder
					return mkdirp( PATH.dirname( dir ) )
						// try the current folder again
						.then( mkdir.bind( null, dir ) );

				} else {
					// does the dir already exist?
					return stat( dir, isDirectory );
				}
			});
	};

});
