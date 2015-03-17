define([
	"ember",
	"routes/UserIndexRoute",
	"routes/InfiniteScrollRouteMixin",
	"utils/preload"
], function( Ember, UserIndexRoute, InfiniteScroll, preload ) {

	var get = Ember.get;

	return UserIndexRoute.extend( InfiniteScroll, {
		itemSelector: ".stream-component",

		model: function() {
			return this.store.findQuery( "twitchStreamsFollowed", {
				offset: get( this, "offset" ),
				limit : get( this, "limit" )
			})
				.then(function( data ) {
					return data.toArray().mapBy( "stream" );
				})
				.then( preload( "@each.preview.@each.medium_nocache" ) );
		}
	});

});
