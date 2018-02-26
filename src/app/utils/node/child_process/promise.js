import { window as Window } from "nwjs/Window";
import StreamOutputBuffer from "utils/StreamOutputBuffer";
import onShutdown from "utils/node/onShutdown";
import { spawn } from "child_process";


const { setTimeout, clearTimeout } = Window;


/**
 * @param {Array} args
 * @param {Function?} onExit
 * @param {Function?} onStdOut
 * @param {Function?} onStdErr
 * @param {number?} time
 * @returns {Promise}
 */
async function promiseChildprocess( args, onExit, onStdOut, onStdErr, time ) {
	let child;
	let unregisterOnShutdown;
	let timeout;

	function kill() {
		if ( timeout ) {
			clearTimeout( timeout );
		}
		if ( child ) {
			child.kill();
		}
		if ( unregisterOnShutdown ) {
			unregisterOnShutdown();
		}
		child = unregisterOnShutdown = timeout = null;
	}

	return new Promise( ( resolve, reject ) => {
		child = spawn( ...args );
		child.once( "error", reject );

		if ( onExit ) {
			child.once( "exit", code => onExit( code, resolve, reject ) );
		} else {
			child.once( "exit", code => resolve( code ) );
		}

		unregisterOnShutdown = onShutdown( kill );

		if ( onStdOut ) {
			child.stdout.on( "data", new StreamOutputBuffer(
				line => onStdOut( line, resolve, reject )
			) );
		}
		if ( onStdErr ) {
			child.stderr.on( "data", new StreamOutputBuffer(
				line => onStdErr( line, resolve, reject )
			) );
		}
		if ( time ) {
			timeout = setTimeout( kill, time );
		}
	})
		.finally( kill );
}


export default promiseChildprocess;
