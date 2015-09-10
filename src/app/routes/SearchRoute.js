define([
	"Ember",
	"mixins/InfiniteScrollMixin",
	"utils/preload"
], function(
	Ember,
	InfiniteScrollMixin,
	preload
) {

	var get = Ember.get;
	var set = Ember.set;

	function filterMatches( filter, value ) {
		return filter === "all" || filter === value;
	}


	return Ember.Route.extend( InfiniteScrollMixin, {
		contentPath: "controller.model.streams",

		itemSelector: ".stream-component",


		model: function( params ) {
			if ( arguments.length > 0 ) {
				set( this, "filter", params.filter );
				set( this,  "query",  params.query );
			}

			var store = get( this, "store" );

			return Promise.all([
				// search for games
				filterMatches( params.filter, "games" )
					? store.query( "twitchSearchGame", {
						query: params.query,
						type : "suggest",
						live : true
					})
					: Promise.resolve([]),
				// search for channels
				filterMatches( params.filter, "channels" )
					? store.query( "twitchSearchChannel", {
						query : params.query,
						offset: 0,
						limit : 10
					})
					: Promise.resolve([]),
				// search for streams
				filterMatches( params.filter, "streams" )
					? store.query( "twitchSearchStream", {
						query : params.query,
						offset: get( this, "offset" ),
						limit : get( this, "limit" )
					})
					: Promise.resolve([])
			])
				.then(function( queries ) {
					return {
						games   : queries[0].toArray().mapBy( "game" ),
						channels: queries[1].toArray().mapBy( "channel" ),
						streams : queries[2].toArray().mapBy( "stream" )
					};
				})
				.then( preload([
					"games.@each.box.@each.large",
					"streams.@each.preview.@each.medium_nocache",
					"channels.@each.logo"
				]) );
		},

		fetchContent: function() {
			if ( !filterMatches( get( this, "filter" ), "streams" ) ) {
				return Promise.resolve([]);
			}

			return get( this, "store" ).query( "twitchSearchStream", {
				query : get( this, "query" ),
				offset: get( this, "offset" ),
				limit : get( this, "limit" )
			})
				.then(function( data ) { return data.toArray().mapBy( "stream" ); })
				.then( preload( "@each.preview.@each.medium_nocache" ) );
		},

		setupController: function( controller ) {
			this._super.apply( this, arguments );

			set( controller,  "filter", get(  this,  "filter" ) );
			set( controller,   "query", get(  this,   "query" ) );
		}
	});

});
