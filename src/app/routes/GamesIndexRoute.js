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

	return Ember.Route.extend( InfiniteScrollMixin, {
		itemSelector: ".game-component",

		model: function() {
			return get( this, "store" ).query( "twitchGamesTop", {
				offset: get( this, "offset" ),
				limit : get( this, "limit" )
			})
				.then(function( data ) { return data.toArray(); })
				.then( preload( "@each.game.@each.box.@each.large" ) );
		}
	});

});
