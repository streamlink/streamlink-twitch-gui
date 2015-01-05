define( [ "ember" ], function( Ember ) {

	return Ember.Controller.extend({
		needs: [ "userAuth", "notification" ],

		notif_running: Ember.computed.readOnly( "controllers.notification.running" ),
		notif_error  : Ember.computed.readOnly( "controllers.notification.error" ),

		actions: {
			"signout": function() {
				this.get( "controllers.userAuth" ).send( "signout" );
				this.transitionToRoute( "user.auth" );
			},

			"notifications_restart": function() {
				this.get( "controllers.notification" ).start();
			}
		}
	});

});
