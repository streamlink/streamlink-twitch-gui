define([
	"ember",
	"routes/UserIndexRoute",
	"routes/InfiniteScrollRouteMixin",
	"utils/preload"
], function( Ember, UserIndexRoute, InfiniteScroll, preload ) {

	return UserIndexRoute.extend( InfiniteScroll, {
		itemSelector: ".stream-component",
		itemHeight: 207,

		model: function() {
			return this.store.findQuery( "twitchStreamsFollowed", {
				offset	: Ember.get( this, "offset" ),
				limit	: Ember.get( this, "limit" )
			})
				.then(function( data ) { return data.toArray(); })
				.then( preload( "@each.preview.@each.medium" ) );
		}
	});

});
