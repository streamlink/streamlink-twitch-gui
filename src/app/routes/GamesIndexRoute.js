define( [ "ember", "models/GamesTop" ], function( Ember, Model ) {

	return Ember.Route.extend({
		model: function() {
			return Model();
		}
	});

});
