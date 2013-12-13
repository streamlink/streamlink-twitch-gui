define( [ "ember", "models/Streams" ], function( Ember, Model ) {

	return Ember.Route.extend({
		model: function() {
			return Model();
		}
	});

});
