define( [ "utils/twitch" ], function( twitch ) {

	return function() {
		return twitch( "streams/summary" );
	}

});
