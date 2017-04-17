import { logDebug } from "./logger";
import spawn from "utils/node/child_process/spawn";


const { assign } = Object;


/**
 * @param {ExecObj} execObj
 * @param {String[]} params
 * @param {Object} options
 */
export default function( execObj, params, options = {} ) {
	const { exec, pythonscript, env } = execObj;

	if ( pythonscript ) {
		params = [ pythonscript, ...( params || [] ) ];
	}

	if ( env ) {
		options.env = assign( {}, options.env, env );
	}

	logDebug( "Spawning streaming provider process", {
		exec,
		params,
		env
	});

	return spawn(
		exec,
		params,
		options
	);
}
