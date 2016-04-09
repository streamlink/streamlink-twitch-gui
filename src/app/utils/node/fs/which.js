define([
	"utils/node/fs/stat",
	"utils/node/platform",
	"commonjs!path"
], function(
	stat,
	platform,
	PATH
) {

	var paths = ( process.env.PATH || process.env.path || "." ).split( PATH.delimiter );
	var exts  = platform.isWin ? [ ".exe" ] : [ "" ];
	var sep   = PATH.sep;


	/**
	 * Locate a command
	 * @param {string} file
	 * @param {Function?} callback
	 * @returns {Promise<string>} The resolved promise will return the path
	 */
	function which( file, callback ) {
		// absolute or relative
		if ( file.indexOf( sep ) !== -1 ) {
			return stat( file, callback );

		// search in every PATHS + EXTS
		} else {
			// Start with a rejected promise and build a promise chain with catches.
			// The first resolving file check will jump to the end of the chain.
			return paths.reduce(function( chain, path ) {
				return chain.catch(function() {
					return exts.reduce(function( chain, ext ) {
						return chain.catch(function() {
							return stat( path + sep + file + ext, callback );
						});
					}, chain );
				});
			}, Promise.reject() );
		}
	}


	return which;

});
