define( [ "nwGui", "ember" ], function( nwGui, Ember ) {

	var get = Ember.get;

	return Ember.Controller.extend({
		auth        : Ember.inject.service(),
		notification: Ember.inject.service(),

		notif_running: Ember.computed.readOnly( "notification.running" ),
		notif_error  : Ember.computed.readOnly( "notification.error" ),

		scope: function() {
			return get( this, "auth.session.scope" ).split( "+" ).join( ", " );
		}.property( "auth.session.scope" ),

		actions: {
			"signout": function() {
				get( this, "auth" ).signout()
					.then(function() {
						this.transitionToRoute( "user.auth" );
					}.bind( this ) );
			},

			"notifications_restart": function() {
				get( this, "notification" ).start();
			},

			"copyToken": function( callback ) {
				var token = get( this, "auth.session.access_token" );
				var cb = nwGui.Clipboard.get();
				if ( !token || !cb ) { return; }

				cb.set( token, "text" );
				if ( callback instanceof Function ) {
					callback();
				}
			}
		}
	});

});
