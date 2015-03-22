if ( typeof DEBUG === "undefined" ) {
	DEBUG = true;
}

if ( DEBUG ) {
	window.initialized = false;

	// don't show the node-webkit exception page during debug mode
	process.on( "uncaughtException", function() {
		if ( window.initialized ) { return; }
		try {
			// show the application window and the dev tools on any error
			// before the ready event fired
			var nwWindow = window.nwDispatcher.requireNwGui().Window.get();
			nwWindow.show();
			nwWindow.showDevTools();
		} catch( e ) {}
	});
}


define(function( require ) {
	require( [ "config" ], function() {
		require( [ "app" ] );
	});
});
