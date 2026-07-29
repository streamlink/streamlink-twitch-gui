import { streaming as streamingConfig } from "config";
import { providerCache } from "../cache";
import { logDebug } from "../logger";
import { ProviderError } from "../errors";
import isAborted from "../is-aborted";
import ExecObj from "../exec-obj";
import findPythonscriptInterpreter from "./find-pythonscript-interpreter";
import validateProvider from "./validate";
import { platform } from "utils/node/platform";
import { isFile } from "utils/node/fs/stat";
import whichFallback from "utils/node/fs/whichFallback";


const { hasOwnProperty } = {};
const { providers: providersConfData } = streamingConfig;


/**
 * Get the path of the executable and pythonscript
 * @param {Stream} stream
 * @param {String} provider
 * @param {Object} providersUserData
 * @returns {Promise.<ExecObj>}
 */
export default async function( stream, provider, providersUserData ) {
	isAborted( stream );

	// then check for already cached stream provider data
	const cache = providerCache.get();
	if ( cache ) {
		return cache;
	}

	// check for known providers first
	if (
		   !hasOwnProperty.call( providersConfData, provider )
		|| !hasOwnProperty.call( providersUserData, provider )
	) {
		throw new Error( `Invalid streaming provider: ${provider}` );
	}

	// provider objects
	const providerConfData = providersConfData[ provider ];
	const providerUserData = providersUserData[ provider ];
	const isPython = hasOwnProperty.call( providerConfData, "python" );

	await logDebug( "Resolving streaming provider", { provider, providerUserData } );

	// custom or default executable
	const providerConfDataExec = providerConfData[ "exec" ][ platform ];
	const providerUserDataExec = providerUserData[ "exec" ];
	const providerExec = providerUserDataExec || providerConfDataExec;
	if ( !providerExec ) {
		throw new Error( "Missing executable name for streaming provider" );
	}

	// the object containing the path to the exec (and pythonscript) and env data
	const execObj = new ExecObj();

	// try to find the pythonscript
	if ( isPython ) {
		const providerConfDataPythonscript = providerConfData[ "pythonscript" ][ platform ];
		const providerUserDataPythonscript = providerUserData[ "pythonscript" ];
		const providerPythonscript = providerUserDataPythonscript || providerConfDataPythonscript;
		if ( !providerPythonscript ) {
			throw new Error( "Missing python script for streaming provider" );
		}

		let pythonscript;

		try {
			// resolve pythonscript
			pythonscript = await whichFallback(
				providerPythonscript,
				providerConfData[ "pythonscriptfallback" ],
				isFile
			);
			execObj.params = [ pythonscript ];
		} catch ( error ) {
			throw new ProviderError( "Couldn't find python script", error );
		}

		// try to find a python script interpreter if no custom exec has been set
		try {
			// parse pythonscript and find the correct python interpreter
			const newExecObj = await findPythonscriptInterpreter(
				pythonscript,
				providerConfData,
				providerUserDataExec
			);
			// merge with existing execObj
			execObj.merge( newExecObj );
		} catch ( error ) {
			throw new ProviderError( "Couldn't validate python script", error );
		}
	}

	// try to find the executable
	try {
		if ( providerUserDataExec ) {
			// resolve custom exec
			execObj.exec = await whichFallback( providerUserDataExec );
		} else if ( !execObj.exec ) {
			// resolve default exec (if we don't have an exec yet)
			execObj.exec = await whichFallback( providerExec, providerConfData[ "fallback" ] );
		}
	} catch ( error ) {
		const str = isPython ? "python " : "";
		throw new ProviderError( `Couldn't find ${str}executable`, error );
	}

	isAborted( stream );

	await logDebug( "Found streaming provider", execObj );
	const validationData = await validateProvider( execObj, providerConfData );
	await logDebug( "Validated streaming provider", validationData );

	providerCache.set( execObj );

	return execObj;
}
