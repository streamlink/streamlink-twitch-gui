define( [ "ember", "utils/twitch" ], function( Ember, twitch ) {

	function Search( params ) {
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

	Search.filters = [
		{ label: "All", value: "all" },
		{ label: "Game", value: "games" },
		{ label: "Stream", value: "streams" }
	];

	Search.filters.forEach(function( filter, i ) {
		filter.id = "searchfilter" + i;
	});

	Search.filtermap = Search.filters.reduce(function( map, filter ) {
		map[ filter.value ] = filter;
		return map;
	}, {} );

	return Search;

});
