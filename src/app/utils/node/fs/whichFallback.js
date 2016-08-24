import { platform } from "utils/node/platform";
import resolvePath from "utils/node/resolvePath";
import which from "utils/node/fs/which";
import {
	stat,
	isExecutable
} from "utils/node/fs/stat";
import PATH from "path";


/**
 * @typedef {Object} PlatformList
 * @property {(String|String[])} win32
 * @property {(String|String[])} darwin
 * @property {(String|String[])} linux
 */

/**
 * Check for executables in $PATH or in a list of fallback paths
 * @param {(String|String[]|PlatformList)} exec
 * @param {(String|String[]|PlatformList)?} fallback
 * @param {Function?} check
 * @returns {Promise}
 */
function whichFallback( exec, fallback, check ) {
	// executable parameter is required
	if ( !exec ) {
		return Promise.reject( new Error( "Missing executable name" ) );
	// get executables for current platform
	} else if ( exec.hasOwnProperty( platform ) ) {
		exec = exec[ platform ];
	}

	// always use a list of names
	if ( !( exec instanceof Array ) ) {
		exec = [ exec ];
	}

	// default file check callback
	if ( !check ) {
		check = isExecutable;
	}


	// check all executables first
	return exec.reduce(function( chain, name ) {
		return chain.catch(function() {
			// first valid file resolves the promise chain
			return which( name, check );
		});
	}, Promise.reject() )
		.catch(function() {
			// no fallbacks defined
			if ( !fallback ) {
				return Promise.reject( new Error( "Executables were not found" ) );
			// get fallbacks for current platform
			} else if ( fallback.hasOwnProperty( platform ) ) {
				fallback = fallback[ platform ];
			}

			// always use a list of fallbacks
			if ( !( fallback instanceof Array ) ) {
				fallback = [ fallback ];
			}

			// check all fallback paths now
			return fallback.reduce(function( chain, path ) {
				return chain.catch(function() {
					// resolve env vars in fallback path definition
					var resolvedPath = resolvePath( path );
					// check each executable in each fallback path
					return exec.reduce(function( chain, name ) {
						return chain.catch(function() {
							// append filename to path
							var filePath = PATH.join( resolvedPath, name );
							return stat( filePath, check );
						});
					}, chain );
				});
			}, Promise.reject() );
		});
}


export default whichFallback;
