define( [ "ember", "utils/twitch" ], function( Ember, twitch ) {

	return function( params ) {
		params = params || {};

		return Ember.RSVP.Promise.all([
			// search for games
			params.filter === "games" || params.filter === "all"
				? twitch( "search/games", {
					query: params.query,
					type: "suggest",
					live: true
				} ).then(function( res ) { return res.games; })
				: Ember.RSVP.Promise.resolve( [] ),
			// search for streams
			params.filter === "streams" || params.filter === "all"
				? twitch( "search/streams", {
					query: params.query
				} ).then(function( res ) { return res.streams; })
				: Ember.RSVP.Promise.resolve( [] )
		])
			.then(function( queries ) {
				return {
					games	: queries[0],
					streams	: queries[1]
				};
			});
	}

});
