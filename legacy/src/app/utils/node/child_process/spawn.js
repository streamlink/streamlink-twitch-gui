import Process from "nwjs/process";
import { spawn } from "child_process";


const { assign } = Object;


export default function( command, params, options = {} ) {
	const opt = assign( {}, options );

	if ( opt.env ) {
		opt.env = assign( {}, Process.env, opt.env );
	}

	return spawn( command, params, opt );
}
