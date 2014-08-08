// define an unused dependency, so requirejs doesn't insert the requirejs-require here
define( [ "ember" ], function() {

	var	FS		= require( "fs" ),
		isWin	= /^win/.test( process.platform ),
		DS		= isWin ? "\\" : "/",
		PATH	= process.env.PATH || process.env.Path || process.env.path || ".",
		PATHS	= PATH.split( isWin ? ";" : ":" ),
		EXTS	= isWin ? [ ".exe" ] : [ "" ]; // isWin ? process.env.PATHEXT.split( ";" ) : [ "" ]


	/**
	 * Does the file exist and is it executable?
	 * @param {string} file
	 * @returns {Promise}
	 */
	function checkFile( file ) {
		return new Promise(function( resolve, reject ) {
			FS.stat( file, function( err, stat ) {
				// check for executable flag on non-windows
				if ( !err && ( isWin || stat.mode & 0111 ) ) {
					resolve( file );
				} else {
					reject();
				}
			});
		});
	}

	/**
	 * Locate a command
	 * @param {string} file
	 * @returns {Promise}
	 */
	return function which( file ) {
		// absolute or relative
		if ( file.indexOf( DS ) !== -1 ) {
			return checkFile( file );

		// search in every PATHS + EXTS
		} else {
			/*
			 * Start with a rejected promise and build a promise chain with catches.
			 * The first resolving file check will jump to the end of the chain.
			 */
			return PATHS.reduce(function( chain, path ) {
				return chain.catch(function() {
					return EXTS.reduce(function( chain, ext ) {
						return chain.catch(function() {
							return checkFile( path + DS + file + ext );
						});
					}, chain );
				});
			}, Promise.reject() );
		}
	}

});
