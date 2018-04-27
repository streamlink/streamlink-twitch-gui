
global.process.removeAllListeners();

global.process.on( "uncaughtException", function( err ) {
	// do nothing if window was fully initialized
	if ( window && window.initialized ) { return; }

	// show the app window and dev tools while being in debug mode
	if ( DEBUG ) {
		try {
			let nwWindow = require( "nw.gui" ).Window.get();
			nwWindow.show();
			nwWindow.showDevTools();
			return;
		} catch ( e ) {}
	}

	// write to stderr and kill the process with error code 1
	global.process.stderr.write([
		"Could not initialize application window",
		require( "util" ).inspect( err ),
		""
	].join( "\n" ) );
	global.process.exit( 1 );
});


require( "shim" );
require( "jquery" );
require( "ember-source/dist/ember.debug" );
require( "./logger" );
require( "./app" );
