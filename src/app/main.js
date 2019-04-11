
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


// "pre-load" certain native node modules
// prevents a bug on Windows which causes all methods of stream.Writable.prototype to be missing
// on stream.Duplex.prototype, more specifically stream.Duplex.prototype.cork. Also related to
// all classes which extend stream.Duplex, like net.Socket.
// See https://github.com/streamlink/streamlink-twitch-gui/issues/628#issuecomment-481510654
require( "stream" );
require( "net" );


require( "shim" );
require( "jquery" );
require( "ember" );
require( "./logger" );
require( "./app" );
