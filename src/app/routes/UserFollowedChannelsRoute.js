define([
	"ember",
	"routes/UserIndexRoute",
	"mixins/InfiniteScrollRouteMixin",
	"utils/preload"
], function(
	Ember,
	UserIndexRoute,
	InfiniteScrollRouteMixin,
	preload
) {

	var get = Ember.get;

	return UserIndexRoute.extend( InfiniteScrollRouteMixin, {
		itemSelector: ".channel-component",

		model: function() {
			return this.store.findQuery( "twitchChannelsFollowed", {
				offset: get( this, "offset" ),
				limit : get( this, "limit" )
			})
				.then(function( data ) {
					return data.toArray().mapBy( "channel" );
				})
				.then( preload( "@each.logo" ) );
		}
	});

});
