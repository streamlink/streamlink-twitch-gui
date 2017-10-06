import Process from "nwjs/process";


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
		Process.removeListener( "SIGTERM", wrapper );
		Process.removeListener( "SIGHUP", wrapper );
	};

	Process.addListener( "exit", wrapper );
	Process.addListener( "SIGTERM", wrapper );
	Process.addListener( "SIGHUP", wrapper );

	return unregister;
}


export default onShutdown;
