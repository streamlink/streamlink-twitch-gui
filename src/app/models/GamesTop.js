define( [ "utils/twitch" ], function( twitch ) {

	return function( params ) {
		params = params || {};

		return twitch( "games/top", {
			limit	: params.limit || 25,
			offset	: params.offset || 0
		});
	}

});
