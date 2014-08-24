define( [ "ember", "utils/preload" ], function( Ember, preload ) {

	var	get	= Ember.get,
		set	= Ember.set;

	function filterMatches( filter, value ) {
		return filter === "all" || filter === value;
	}

	return Ember.Route.extend({
		model: function( params ) {
			set( this, "filter", params.filter );
			set( this,  "query",  params.query );

			return Ember.RSVP.Promise.all([

				// search for games
				filterMatches( params.filter, "games" )
					? this.store.findQuery( "twitchSearchGame", {
						query: params.query,
						type: "suggest",
						live: true
					})
					: Promise.resolve([]),

				// search for streams
				filterMatches( params.filter, "streams" )
					? this.store.findQuery( "twitchSearchStream", {
						query: params.query
					})
					: Promise.resolve([])

			])
				.then(function( queries ) {
					return {
						games	: queries[0].toArray(),
						streams	: queries[1].toArray()
					};
				})
				.then( preload([
					"games.@each.box.@each.large",
					"streams.@each.preview.@each.medium"
				]) );
		},

		setupController: function( controller, model ) {
			this._super.apply( this, arguments );

			set( controller,  "filter", get(  this,  "filter" ) );
			set( controller,   "query", get(  this,   "query" ) );
			set( controller,   "games", get( model,   "games" ) );
			set( controller, "streams", get( model, "streams" ) );
		}
	});

});
