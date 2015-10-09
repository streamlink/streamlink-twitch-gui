define([
	"utils/fs/stat",
	"commonjs!path"
], function(
	stat,
	PATH
) {

	var paths = ( process.env.PATH || process.env.path || "." ).split( PATH.delimiter );
	var exts  = process.platform === "win32" ? [ ".exe" ] : [ "" ];
	var sep   = PATH.sep;


	/**
	 * Locate a command
	 * @param {string} file
	 * @param {Function?} check
	 * @returns {Promise}
	 */
	return function which( file, check ) {
		// absolute or relative
		if ( file.indexOf( sep ) !== -1 ) {
			return stat( file, check );

		// search in every PATHS + EXTS
		} else {
			/*
			 * Start with a rejected promise and build a promise chain with catches.
			 * The first resolving file check will jump to the end of the chain.
			 */
			return paths.reduce(function( chain, path ) {
				return chain.catch(function() {
					return exts.reduce(function( chain, ext ) {
						return chain.catch(function() {
							return stat( path + sep + file + ext, check );
						});
					}, chain );
				});
			}, Promise.reject() );
		}
	};

});
