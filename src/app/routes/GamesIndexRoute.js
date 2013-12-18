define( [ "ember", "models/GamesTop", "utils/preload" ], function( Ember, Model, preload ) {

	return Ember.Route.extend({
		model: function() {
			return preload(
				Model(),
				function( res ) {
					return Object.create( res.top ).map(function( top ) {
						return top.game.box.large;
					});
				}
			);
		}
	});

});
