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

	// load the config first
	require( [ "config" ], function() {

		// fix ember 1.13.x
		// https://github.com/emberjs/ember.js/issues/11679
		var process = window.process;
		window.process = null;

		// load dependencies
		require([
			"Ember",
			"EmberHtmlbars",
			"EmberData",
			"EmberDataLS"
		], function() {

			window.process = process;

			// load the app module
			require( [ "app" ] );

		});

	});

});
