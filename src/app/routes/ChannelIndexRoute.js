define( [ "ember" ], function( Ember ) {

	return Ember.Route.extend({
		refresh: function() {
			return this.container.lookup( "route:channel" ).refresh();
		}
	});

});
