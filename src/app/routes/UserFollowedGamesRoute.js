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
		itemSelector: ".game-component",

		model: function() {
			return this.store.findQuery( "twitchGamesFollowed", {
				offset: get( this, "offset" ),
				limit : get( this, "limit" )
			})
				.then(function( data ) {
					return data.toArray();
				})
				.then( preload( "@each.box.@each.large" ) );
		}
	});

});
