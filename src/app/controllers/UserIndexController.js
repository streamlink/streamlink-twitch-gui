define( [ "ember" ], function( Ember ) {

	return Ember.Controller.extend({
		needs: [ "userAuth", "notification" ],

		notifications: Ember.computed.readOnly( "controllers.notification.enabled" ),

		actions: {
			"signout": function() {
				this.get( "controllers.userAuth" ).send( "signout" );
				this.transitionToRoute( "user.auth" );
			}
		}
	});

});
