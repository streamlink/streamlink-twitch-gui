import { stat } from "utils/node/fs/stat";
import { paths } from "utils/node/env-path";
import { sep, join } from "path";


/**
 * Locate a command
 * @param {string} file
 * @param {Function?} callback
 * @returns {Promise<string>} The resolved promise will return the path
 */
async function which( file, callback ) {
	if ( !file ) {
		throw new Error( "Missing file" );
	}

	// is file absolute or relative?
	if ( file.includes( sep ) ) {
		return await stat( file, callback );
	}

	// iterate through all paths and return first matching file
	for ( const path of paths ) {
		try {
			const resolvedPath = await stat( join( path, file ), callback );
			if ( resolvedPath ) {
				return resolvedPath;
			}
		} catch ( e ) {}
	}

	throw new Error( `Could not find ${file}` );
}


export default which;
