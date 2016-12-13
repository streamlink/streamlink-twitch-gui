import StreamOutputBuffer from "utils/StreamOutputBuffer";
import { spawn } from "child_process";


function promiseChildprocess( args, onExit, onStdOut ) {
	let child;

	function kill() {
		if ( child ) {
			child.kill();
		}
		child = null;
		process.removeListener( "exit", kill );
	}

	return new Promise( ( resolve, reject ) => {
		child = spawn( ...args );
		child.once( "error", reject );

		if ( onExit ) {
			child.on( "exit", code => onExit( code, resolve, reject ) );
		}

		process.on( "exit", kill );

		if ( onStdOut ) {
			child.stdout.on( "data", new StreamOutputBuffer(
				line => onStdOut( line, resolve, reject )
			) );
		}
	})
		.finally( kill );
}


export default promiseChildprocess;
