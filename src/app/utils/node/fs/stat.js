import { isWin } from "utils/node/platform";
import { stat as fsStat } from "fs";
import { resolve } from "path";
import { promisify } from "util";


const fsStatPromisified = promisify( fsStat );


/**
 * Asynchronously get stats of a path in the filesystem and validate it
 * @param {string}    path        The path
 * @param {Function?} validation  Validation callback. First parameter is the stats object
 * @param {boolean?}  returnStats Return the stats object instead of the path
 * @returns {Promise<(string|fs.Stats)>}
 */
export async function stat( path, validation, returnStats ) {
	const resolvedPath = resolve( path );
	const stats = await fsStatPromisified( resolvedPath );

	if ( validation instanceof Function && !validation( stats ) ) {
		throw new Error( "Invalid" );
	}

	return returnStats
		? stats
		: resolvedPath;
}


export function isDirectory( stats ) {
	return stats.isDirectory();
}

export function isFile( stats ) {
	return stats.isFile();
}

export function isExecutable( stats ) {
	return stats.isFile()
	    && ( isWin || ( stats.mode & 0o111 ) > 0 );
}
