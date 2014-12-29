define( [ "utils/denodify", "utils/stat" ], function( denodify, stat ) {

	var PATH = require( "path" ),
	    FS   = require( "fs" );

	var mkdir = denodify( FS.mkdir );

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
