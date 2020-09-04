import { promises as fsPromises } from "fs";


const { mkdir } = fsPromises;


/**
 * @param {string} path
 * @param {Object?} options
 * @param {(string|number)?} options.mode
 * @returns {Promise}
 */
export default async function mkdirp( path, options = {} ) {
	return mkdir( path, Object.assign( {}, options, { recursive: true } ) );
}
