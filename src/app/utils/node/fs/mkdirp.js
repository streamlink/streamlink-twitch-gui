import { stat, isDirectory } from "utils/node/fs/stat";
import { isWin } from "utils/node/platform";
import { dirname } from "path";
import { mkdir, W_OK } from "fs";
import { promisify } from "util";


/**
 * @type {Function}
 * @returns {Promise}
 */
const fsMkdir = promisify( mkdir );


export function check( stats ) {
	return isDirectory( stats )
	    && ( isWin || ( stats.mode & W_OK ) > 0 );
}


/**
 * simplified and promisified version of node-mkdirp
 * https://github.com/substack/node-mkdirp
 * @param {string} dir
 * @returns {Promise}
 */
async function mkdirp( dir ) {
	try {
		// try to create directory
		await fsMkdir( dir );

	} catch ( err ) {
		// directory already exists
		if ( err && err.code === "EEXIST" ) {
			return dir;
		}

		// recursively try to create the parent folder
		if ( err && err.code === "ENOENT" ) {
			const parent = dirname( dir );
			if ( parent === dir ) {
				throw new Error( "Can't create parent folder" );
			}

			await mkdirp( parent );
			// try the current folder again
			return await fsMkdir( dir );
		}

		// check if current directory is a directory and whether it is writable
		return await stat( dir, check );
	}
}


export default mkdirp;
