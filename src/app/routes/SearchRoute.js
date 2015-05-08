define([
	"ember",
	"mixins/InfiniteScrollRouteMixin",
	"utils/preload"
], function( Ember, InfiniteScrollRouteMixin, preload ) {

	var get = Ember.get,
	    set = Ember.set;

	function filterMatches( filter, value ) {
		return filter === "all" || filter === value;
	}


	return Ember.Route.extend( InfiniteScrollRouteMixin, {
		contentPath: "controller.model.streams",

		itemSelector: ".stream-component",


		model: function( params ) {
			if ( arguments.length > 0 ) {
				set( this, "filter", params.filter );
				set( this,  "query",  params.query );
			}

			return Promise.all([
				// search for games
				filterMatches( params.filter, "games" )
					? this.store.findQuery( "twitchSearchGame", {
						query: params.query,
						type : "suggest",
						live : true
					})
					: Promise.resolve([]),
				// search for channels
				filterMatches( params.filter, "channels" )
					? this.store.findQuery( "twitchSearchChannel", {
						query : params.query,
						offset: 0,
						limit : 10
					})
					: Promise.resolve([]),
				// search for streams
				filterMatches( params.filter, "streams" )
					? this.store.findQuery( "twitchSearchStream", {
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

			return this.store.findQuery( "twitchSearchStream", {
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
