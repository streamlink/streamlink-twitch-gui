define([
	"ember",
	"routes/InfiniteScrollRouteMixin",
	"utils/preload"
], function( Ember, InfiniteScroll, preload ) {

	var	get	= Ember.get,
		set	= Ember.set;

	function filterMatches( filter, value ) {
		return filter === "all" || filter === value;
	}


	return Ember.Route.extend( InfiniteScroll, {
		content: "controller.model.streams",

		itemSelector: ".stream-component",


		model: function( params ) {
			set( this, "filter", params.filter );
			set( this,  "query",  params.query );

			return Promise.all([

				// search for games
				filterMatches( params.filter, "games" )
					? this.store.findQuery( "twitchSearchGame", {
						query	: params.query,
						type	: "suggest",
						live	: true
					})
					: Promise.resolve([]),

				// search for streams
				filterMatches( params.filter, "streams" )
					? this.store.findQuery( "twitchSearchStream", {
						query	: params.query,
						offset	: get( this, "offset" ),
						limit	: get( this, "limit" )
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

		fetchContent: function() {
			if ( !filterMatches( get( this, "filter" ), "streams" ) ) {
				return Promise.resolve([]);
			}

			return this.store.findQuery( "twitchSearchStream", {
				query	: get( this, "query" ),
				offset	: get( this, "offset" ),
				limit	: get( this, "limit" )
			})
				.then(function( data ) { return data.toArray(); })
				.then( preload( "@each.preview.@each.medium" ) );
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
