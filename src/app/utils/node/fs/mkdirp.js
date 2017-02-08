import denodify from "utils/node/denodify";
import {
	stat,
	isDirectory
} from "utils/node/fs/stat";
import { isWin } from "utils/node/platform";
import { dirname } from "path";
import {
	mkdir,
	W_OK
} from "fs";


/**
 * @type {Function}
 * @returns {Promise}
 */
const fsMkdir = denodify( mkdir );

export const check = stats => {
	return isDirectory( stats )
	    && ( isWin || ( stats.mode & W_OK ) > 0 );
};


/**
 * simplified and promisified version of node-mkdirp
 * https://github.com/substack/node-mkdirp
 * @param {String} dir
 * @returns {Promise}
 */
function mkdirp( dir ) {
	return fsMkdir( dir )
		.catch( err => {
			if ( err && err.code === "EEXIST" ) {
				// directory already exists
				return Promise.resolve( dir );

			} else if ( err && err.code === "ENOENT" ) {
				// recursively try to create the parent folder
				let parent = dirname( dir );
				if ( parent === dir ) {
					throw new Error( "Can't create parent folder" );
				}

				return mkdirp( parent )
					// try the current folder again
					.then( () => fsMkdir( dir ) );

			} else {
				// check if current path is a directory and if it is writable
				return stat( dir, check );
			}
		});
}


export default mkdirp;
