define([
	"Ember",
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
			return get( this, "store" ).query( "twitchGamesFollowed", {
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
