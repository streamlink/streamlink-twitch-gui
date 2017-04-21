import { logDebug } from "./logger";
import spawn from "utils/node/child_process/spawn";


const { assign } = Object;


/**
 * @param {ExecObj} execObj
 * @param {String[]} additonalParams
 * @param {Object} options
 * @returns {ChildProcess}
 */
export default function( execObj, additonalParams = [], options = {} ) {
	let { exec, params, env } = execObj;

	params = [
		...( params || [] ),
		...( additonalParams || [] )
	];

	if ( env ) {
		options.env = assign( {}, options.env, env );
	}

	logDebug( "Spawning process", {
		exec,
		params,
		env
	});

	return spawn( exec, params, options );
}
