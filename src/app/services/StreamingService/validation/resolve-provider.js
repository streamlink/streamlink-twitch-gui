import { streamprovider as streamproviderConfig } from "config";
import {
	getCache,
	setupCache
} from "../cache";
import { logDebug } from "../logger";
import { NotFoundError } from "../errors";
import isAborted from "../is-aborted";
import ExecObj from "./exec-obj";
import findPythonscriptInterpreter from "./find-pythonscript-interpreter";
import validateProvider from "./validate-provider";
import {
	platform as platformName
} from "utils/node/platform";
import { isFile } from "utils/node/fs/stat";
import whichFallback from "utils/node/fs/whichFallback";


const { assign } = Object;
const { hasOwnProperty } = {};
const { providers: providersData } = streamproviderConfig;


/**
 * Get the path of the executable and pythonscript
 * @param {Stream} stream
 * @param {String} provider
 * @param {Object} providers
 * @returns {Promise.<ExecObj>}
 */
export default async function( stream, provider, providers ) {
	isAborted( stream );

	await logDebug( "Preparing to launch stream", () => stream.toJSON({ includeId: true }) );

	// then check for already cached stream provider data
	const cache = getCache();
	if ( cache ) {
		return cache;
	}

	// check for known providers first
	if (
		   !hasOwnProperty.call( providersData, provider )
		|| !hasOwnProperty.call( providers, provider )
	) {
		throw new Error( `Invalid streaming provider: ${provider}` );
	}

	// provider objects
	const providerConfData = providersData[ provider ];
	const providerUserData = providers[ provider ];
	const isPython = hasOwnProperty.call( providerConfData, "python" );

	await logDebug( "Resolving streaming provider", { provider, providerUserData } );

	// custom or default executable
	const providerConfDataExec = providerConfData[ "exec" ][ platformName ];
	const providerUserDataExec = providerUserData[ "exec" ];
	const providerExec = providerUserDataExec || providerConfDataExec;
	if ( !providerExec ) {
		throw new Error( "Missing executable name for streaming provider" );
	}

	const execObj = new ExecObj();

	// try to find the pythonscript
	if ( isPython ) {
		const providerConfDataPythonscript = providerConfData[ "pythonscript" ][ platformName ];
		const providerUserDataPythonscript = providerUserData[ "pythonscript" ];
		try {
			execObj.pythonscript = await whichFallback(
				providerUserDataPythonscript || providerConfDataPythonscript,
				providerConfData[ "pythonscriptfallback" ],
				isFile
			);
		} catch ( e ) {
			throw new NotFoundError( "Could not find Python script." );
		}
	}

	// try to find the executable
	try {
		// has custom exec
		if ( providerUserDataExec ) {
			execObj.exec = await whichFallback( providerUserDataExec );
		}

		try {
			// find the correct interpreter of the python script
			if ( isPython ) {
				const parsedExecObj = await findPythonscriptInterpreter(
					execObj.pythonscript,
					providerConfDataExec
				);
				assign( execObj, parsedExecObj );
			} else {
				// do the normal lookup in the catch block
				throw null;
			}
		} catch ( e ) {
			// find the exec with fallback paths if the provider is a standalone version
			// or if a custom exec has been set or if the shebang parsing method has failed
			execObj.exec = await whichFallback( providerExec, providerConfData[ "fallback" ] );
		}
	} catch ( e ) {
		const str = isPython ? "Python " : "";
		throw new NotFoundError( `Could not find ${str}executable.` );
	}

	isAborted( stream );

	await logDebug( "Found streaming provider", execObj );
	const validationData = await validateProvider( execObj );
	await logDebug( "Validated streaming provider", validationData );

	setupCache( execObj );

	return execObj;
}
