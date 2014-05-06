if ( typeof DEBUG === "undefined" ) {
	DEBUG = true;
}

define(function( require ) {

	require( [ "config" ], function() {

		/**
		 * Load the App
		 */
		require( [ "App" ] );

	});

});
