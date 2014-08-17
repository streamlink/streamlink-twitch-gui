define([
	"ember",
	"routes/InfiniteScrollRouteMixin",
	"utils/preload",
	"models/GamesTop"
], function( Ember, InfiniteScroll, preload, ModelGamesTop ) {

	return Ember.Route.extend( InfiniteScroll, {
		itemSelector: ".game-component",
		itemHeight: 255,

		model: function() {
			return ModelGamesTop({
				offset	: Ember.get( this, "offset" ),
				limit	: Ember.get( this, "limit" )
			})
				.then(function( data ) {
					return Ember.getWithDefault( data, "top", [] );
				})
				.then( preload( "@each.game.@each.box.@each.large" ) );
		}
	});

});
