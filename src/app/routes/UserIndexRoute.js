define( [ "ember" ], function( Ember ) {

	return Ember.Route.extend({
		beforeModel: function( transition ) {
			var authController = this.controllerFor( "userAuth" );
			if ( !authController.get( "model" ) ) {
				transition.abort();
				authController.set( "previousTransition", transition );
				this.transitionTo( "user.auth" );
			}
		}
	});

});
