define( [ "utils/twitch" ], function( twitch ) {

	return function( params ) {
		params = params || {};

		var	query = {
				limit	: params.limit || 25,
				offset	: params.offset || 0
			};

		if ( params.game ) { query.game = params.game; }

		return twitch( "streams", query );
	}

});
