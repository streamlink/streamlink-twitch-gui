define( [ "ember" ], function( Ember ) {

	return Ember.Controller.extend({
		needs: [ "userAuth" ],

		actions: {
			"signout": function() {
				this.get( "controllers.userAuth" ).send( "signout" );
				this.transitionToRoute( "user.auth" );
			}
		}
	});

});
