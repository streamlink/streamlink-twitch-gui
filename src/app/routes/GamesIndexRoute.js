define([
	"ember",
	"utils/preload",
	"models/GamesTop"
], function( Ember, preload, ModelGamesTop ) {

	return Ember.Route.extend({
		model: function() {
			return ModelGamesTop()
				.then( preload( "top.@each.game.@each.box.@each.large" ) );
		}
	});

});
