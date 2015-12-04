define( [ "Ember" ], function( Ember ) {

	return Ember.Route.extend({
		model: function() {
			return this.modelFor( "channel" );
		},

		refresh: function() {
			return this.container.lookup( "route:channel" ).refresh();
		}
	});

});
