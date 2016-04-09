define([
	"utils/node/denodify",
	"utils/node/platform",
	"commonjs!fs"
], function(
	denodify,
	platform,
	FS
) {

	var fsStat = denodify( FS.stat );
	var isWin  = platform.isWin;


	/**
	 * Asynchronously get stats of a path in the filesystem and validate it
	 * @param {String}    path        The path
	 * @param {Function?} callback    Validation callback. First parameter is the stats object
	 * @param {Boolean?}  returnStats Return the stats object instead of the path
	 * @returns {Promise<(String|fs.Stats)>}
	 */
	function stat( path, callback, returnStats ) {
		var promise = fsStat( path );

		if ( callback instanceof Function ) {
			return promise.then(function( stats ) {
				return callback( stats )
					? returnStats ? stats : path
					: Promise.reject();
			});
		}

		return promise.then(function( stats ) {
			return returnStats ? stats : path;
		});
	}


	stat.isDirectory = function( stats ) {
		return stats.isDirectory();
	};

	stat.isFile = function( stats ) {
		return stats.isFile();
	};

	stat.isExecutable = function( stats ) {
		return stats.isFile()
		    // octal: 0111
		    && ( isWin || ( stats.mode & 73 ) > 0 );
	};


	return stat;

});
