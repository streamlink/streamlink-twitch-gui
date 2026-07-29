import { spawn } from "child_process";
import { nextTick } from "process";


export default async function( exec, params ) {
	let child;
	try {
		await new Promise( ( resolve, reject ) => {
			child = spawn( exec, params, {
				detached: true,
				stdio: "ignore"
			});
			child.unref();
			child.once( "error", reject );
			nextTick( resolve );
		});
	} finally {
		child = null;
	}
}
