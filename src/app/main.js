if ( typeof DEBUG === "undefined" ) {
	DEBUG = true;
}

if ( DEBUG ) {
	// don't show the node-webkit exception page during debug mode
	process.on( "uncaughtException", function() {} );
}

define(function( require ) {

	require( [ "config" ], function() {

		// load libraries first
		require( [ "ember", "ember-data", "ember-data-ls" ], function() {

			// then load the app
			require( [ "App" ] );

		});

	});

});
