define( [ "ember" ], function( Ember ) {

	return Ember.Route.extend({
		model: function() {
			return this.store.find( "settings", 1 );
		}
	});

});
