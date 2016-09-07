import denodify from "utils/node/denodify";
import { isWin } from "utils/node/platform";
import FS from "fs";


const fsStat = denodify( FS.stat );


/**
 * Asynchronously get stats of a path in the filesystem and validate it
 * @param {String}    path        The path
 * @param {Function?} callback    Validation callback. First parameter is the stats object
 * @param {Boolean?}  returnStats Return the stats object instead of the path
 * @returns {Promise<(String|fs.Stats)>}
 */
export function stat( path, callback, returnStats ) {
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


export function isDirectory( stats ) {
	return stats.isDirectory();
}

export function isFile( stats ) {
	return stats.isFile();
}

export function isExecutable( stats ) {
	return stats.isFile()
	    // octal: 0111
	    && ( isWin || ( stats.mode & 73 ) > 0 );
}
