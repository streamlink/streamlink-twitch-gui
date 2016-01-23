if ( typeof DEBUG === "undefined" ) {
	DEBUG = true;
}

if ( DEBUG ) {
	window.initialized = false;
}


define(function( require ) {

	global.process.removeAllListeners();

	global.process.on( "uncaughtException", function( err ) {
		console.log( "Uncaught exception:", err );

		if ( DEBUG ) {
			if ( window.initialized ) { return; }
			try {
				var nwWindow = window.nwDispatcher.requireNwGui().Window.get();
				nwWindow.show();
				nwWindow.showDevTools();
			} catch( e ) {}
		}
	});


	// load the config first
	require( [ "config" ], function() {

		// load dependencies
		require([
			"Ember",
			"EmberData",
			"EmberDataLS"
		], function() {

			// load the app module
			require( [ "app" ] );

		});

	});

});
