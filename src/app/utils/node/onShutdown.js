import Process from "nwjs/process";
import nwWindow from "nwjs/Window";


/**
 * @param {Function} callback
 * @returns {Function}
 */
function onShutdown( callback ) {
	const wrapper = () => {
		callback();
		unregister();
	};

	const unregister = () => {
		Process.removeListener( "exit", wrapper );
		Process.removeListener( "SIGHUP", wrapper );
		Process.removeListener( "SIGINT", wrapper );
		Process.removeListener( "SIGTERM", wrapper );
		nwWindow.window.removeEventListener( "beforeunload", wrapper, false );
	};

	Process.addListener( "exit", wrapper );
	Process.addListener( "SIGHUP", wrapper );
	Process.addListener( "SIGINT", wrapper );
	Process.addListener( "SIGTERM", wrapper );
	nwWindow.window.addEventListener( "beforeunload", wrapper, false );

	return unregister;
}


export default onShutdown;
