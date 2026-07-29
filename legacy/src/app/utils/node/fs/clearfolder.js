import { stat, isFile } from "utils/node/fs/stat";
import { join } from "path";
import { readdir, unlink } from "fs";
import { promisify } from "util";


/**
 * @type {Function}
 * @returns {Promise}
 */
const fsReaddir = promisify( readdir );

/**
 * @type {Function}
 * @returns {Promise}
 */
const fsUnlink = promisify( unlink );


/**
 * @param {string[]} files
 * @param {Function} fn
 * @param {...*} args
 * @returns {Promise}
 */
async function execBatchAndIgnoreRejected( files, fn, ...args ) {
	const promises = files.map( file =>
		Promise.resolve( fn( file, ...args ) )
			// always resolve
			.catch( () => null )
	);

	// wait for all promises to resolve
	const resolvedFiles = await Promise.all( promises );

	// filter out files that "didn't resolve"
	return resolvedFiles.filter( file => file !== null );
}


/**
 * Delete files in a directory optionally filtered by age
 * @param {String} dir
 * @param {number?} threshold
 * @returns {Promise}
 */
async function clearfolder( dir, threshold ) {
	/** @type {string[]} */
	let files = await fsReaddir( dir );

	// prepend dir path
	files = files.map( file => join( dir, file ) );

	let resolvedFiles;

	if ( !threshold ) {
		// just return all files if there is no threshold set
		const check = stat => isFile( stat );

		resolvedFiles = await execBatchAndIgnoreRejected( files, stat, check );

	} else {
		// ignore all files newer than X
		const now = Date.now();
		const check = stat => isFile( stat ) && now - stat.mtime > threshold;

		resolvedFiles = await execBatchAndIgnoreRejected( files, stat, check );
	}

	// delete all matched files
	return await execBatchAndIgnoreRejected( resolvedFiles, fsUnlink );
}


export default clearfolder;
