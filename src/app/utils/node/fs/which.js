import { stat } from "utils/node/fs/stat";
import {
	delimiter,
	sep
} from "path";


const paths = ( process.env.PATH || process.env.path || "." ).split( delimiter );


/**
 * Locate a command
 * @param {String} file
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
				return stat( `${path}${sep}${file}`, callback );
			});
		}, Promise.reject() );
	}
}


export default which;
