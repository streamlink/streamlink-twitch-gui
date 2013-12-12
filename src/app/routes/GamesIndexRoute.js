define( [ "ember", "models/GamesTop" ], function( Ember, Model ) {

	return Ember.Route.extend({
		model: function() {
			return Model();
		},

		/**
		 * @param {Ember.Controller} controller
		 * @param {TwitchTopGames} games
		 */
		setupController: function( controller, games ) {
			controller.set( "top", games.top );
		}
	});

});
