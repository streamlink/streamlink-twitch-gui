define( [ "utils/twitch" ], function( twitch ) {

	return function( limit, offset ) {
		return twitch( "games/top", {
			limit	: limit || 25,
			offset	: offset || 0
		});
	}

});
