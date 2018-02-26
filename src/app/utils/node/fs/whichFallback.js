import { platform } from "utils/node/platform";
import resolvePath from "utils/node/resolvePath";
import which from "utils/node/fs/which";
import { stat, isExecutable } from "utils/node/fs/stat";
import { join } from "path";


const { isArray } = Array;


/**
 * @typedef {Object} PlatformList
 * @property {(string|string[])} win32
 * @property {(string|string[])} darwin
 * @property {(string|string[])} linux
 */

/**
 * Check for executables in $PATH or in a list of fallback paths
 * @param {(string|string[]|PlatformList)} exec
 * @param {(string|string[]|PlatformList)?} fallback
 * @param {Function?} check
 * @param {boolean?} fallbackOnly
 * @returns {Promise.<string,Error>}
 */
async function whichFallback( exec, fallback, check, fallbackOnly ) {
	// executable parameter is required
	if ( !exec ) {
		throw new Error( "Missing executable name" );
	}

	// get executables for current platform
	if ( exec.hasOwnProperty( platform ) ) {
		exec = exec[ platform ];
	}

	// always use a list of names
	if ( !isArray( exec ) ) {
		exec = [ exec ];
	}

	// default file check callback
	if ( !check ) {
		check = isExecutable;
	}

	// try to find executable(s) without fallback paths first
	if ( !fallbackOnly ) {
		// get the first executable found in one of the directories registered in $PATH
		for ( const name of exec ) {
			try {
				const resolvedPath = await which( name, check );
				if ( resolvedPath ) {
					return resolvedPath;
				}
			} catch ( e ) {}
		}
	}

	// no fallbacks defined
	if ( !fallback ) {
		throw new Error( "Executables were not found" );
	}

	// get fallbacks for current platform
	if ( fallback.hasOwnProperty( platform ) ) {
		fallback = fallback[ platform ];
	}

	// always use a list of fallbacks
	if ( !isArray( fallback ) ) {
		fallback = [ fallback ];
	}

	// check all fallback paths now
	for ( const path of fallback ) {
		// resolve env vars in fallback path definition
		const fallbackPath = resolvePath( path );
		// check each executable in each fallback path
		for ( const name of exec ) {
			try {
				const resolvedPath = await stat( join( fallbackPath, name ), check );
				if ( resolvedPath ) {
					return resolvedPath;
				}
			} catch ( e ) {}
		}
	}

	throw new Error( "Executables were not found" );
}


export default whichFallback;
