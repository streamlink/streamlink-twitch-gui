
global.process.removeAllListeners();

global.process.on( "uncaughtException", function( err ) {
	console.log( "Uncaught exception:", err );

	// do nothing if window was fully initialized
	if ( window.initialized ) { return; }

	// kill the process while not being in debug mode
	if ( !DEBUG ) {
		global.process.exit( 1 );
	}

	// open the window and dev tools
	try {
		var nwWindow = window.nwDispatcher.requireNwGui().Window.get();
		nwWindow.show();
		nwWindow.showDevTools();
	} catch ( e ) {
		console.log( "Could not initialize application window" );
		global.process.exit( 1 );
	}
});

require( "./app" );
