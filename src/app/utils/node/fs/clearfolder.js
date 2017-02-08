import denodify from "utils/node/denodify";
import {
	stat,
	isFile
} from "utils/node/fs/stat";
import { join } from "path";
import {
	readdir,
	unlink
} from "fs";


/**
 * @type {Function}
 * @returns {Promise}
 */
const fsReaddir = denodify( readdir );

/**
 * @type {Function}
 * @returns {Promise}
 */
const fsUnlink = denodify( unlink );


/**
 * @param {String[]} files
 * @param {Function} fn
 * @param {...*} args
 * @returns {Promise}
 */
function execBatchAndIgnoreRejected( files, fn, ...args ) {
	// wait for all promises to resolve
	return Promise.all( files.map( file => fn( file, ...args )
		// always resolve
		.catch( () => null )
	) )
		// filter out files that "didn't resolve"
		.then( files => files.filter( file => file !== null ) );
}


/**
 * Delete files in a directory optionally filtered by age
 * @param {String} dir
 * @param {Number?} threshold
 * @returns {Promise}
 */
function clearfolder( dir, threshold ) {
	return fsReaddir( dir )
		.then( files => {
			// prepend dir path
			files = files.map( file => join( dir, file ) );

			if ( !threshold ) {
				// just return all files if there is no threshold set
				const check = stat => isFile( stat );

				return execBatchAndIgnoreRejected( files, stat, check );

			} else {
				// ignore all files newer than X
				const now = Date.now();
				const check = stat => isFile( stat ) && now - stat.mtime > threshold;

				return execBatchAndIgnoreRejected( files, stat, check );
			}
		})
		// delete all matched files
		.then( files => execBatchAndIgnoreRejected( files, fsUnlink ) );
}


export default clearfolder;
