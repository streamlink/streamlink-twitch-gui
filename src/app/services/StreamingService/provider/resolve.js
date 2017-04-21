import {
	streamprovider as streamproviderConfig
} from "config";
import { providerCache } from "../cache";
import { logDebug } from "../logger";
import { NotFoundError } from "../errors";
import isAborted from "../is-aborted";
import ExecObj from "../exec-obj";
import findPythonscriptInterpreter from "./find-pythonscript-interpreter";
import validateProvider from "./validate";
import { platform } from "utils/node/platform";
import { isFile } from "utils/node/fs/stat";
import whichFallback from "utils/node/fs/whichFallback";


const { hasOwnProperty } = {};
const { providers: providersConfData } = streamproviderConfig;


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
		} catch ( e ) {
			throw new NotFoundError( "Couldn't find python script" );
		}

		try {
			// parse pythonscript and find the correct python interpreter
			const newExecObj = await findPythonscriptInterpreter(
				pythonscript,
				providerConfDataExec
			);
			// merge with existing execObj
			execObj.merge( newExecObj );
		} catch ( e ) {
			throw new NotFoundError( "Couldn't validate python script" );
		}
	}

	// try to find the executable
	try {
		if ( providerUserDataExec ) {
			// resolve custom exec (even if one was already found by findPythonscriptInterpreter)
			execObj.exec = await whichFallback( providerUserDataExec );
		} else if ( !execObj.exec ) {
			// resolve default exec (if we don't have an exec yet)
			execObj.exec = await whichFallback( providerExec, providerConfData[ "fallback" ] );
		}
	} catch ( e ) {
		const str = isPython ? "python " : "";
		throw new NotFoundError( `Couldn't find ${str}executable` );
	}

	isAborted( stream );

	await logDebug( "Found streaming provider", execObj );
	const validationData = await validateProvider( execObj );
	await logDebug( "Validated streaming provider", validationData );

	providerCache.set( execObj );

	return execObj;
}
