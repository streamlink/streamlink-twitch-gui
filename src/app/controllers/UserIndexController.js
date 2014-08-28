define( [ "ember" ], function( Ember ) {

	return Ember.ObjectController.extend({
		needs: [ "userAuth" ],

		modelBinding: "controllers.userAuth.model",

		actions: {
			"signout": function() {
				this.get( "controllers.userAuth" ).send( "signout" );
				this.transitionToRoute( "user.auth" );
			}
		}
	});

});
