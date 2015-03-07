define( [ "ember" ], function( Ember ) {

	return Ember.Route.extend({
		actions: {
			"willTransition": function() {
				this.set( "controller.auth_failure", false );
			}
		}
	});

});
