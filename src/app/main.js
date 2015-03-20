if ( typeof DEBUG === "undefined" ) {
	DEBUG = true;
}

if ( DEBUG ) {
	// don't show the node-webkit exception page during debug mode
	process.on( "uncaughtException", function() {} );
}


define(function( require ) {
	require( [ "config" ], function() {
		require( [ "app" ] );
	});
});
