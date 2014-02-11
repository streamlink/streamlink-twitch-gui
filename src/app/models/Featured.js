define( [ "utils/twitch" ], function( twitch ) {

	return function( limit, offset ) {
		return twitch( "streams/featured", {
			limit: limit,
			offset: offset
		});
	}

});
