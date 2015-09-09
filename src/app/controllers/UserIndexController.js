define( [ "Ember", "nwjs/nwGui" ], function( Ember, nwGui ) {

	var get = Ember.get;
	var set = Ember.set;
	var readOnly = Ember.computed.readOnly;

	return Ember.Controller.extend({
		auth        : Ember.inject.service(),
		notification: Ember.inject.service(),
		settings    : Ember.inject.service(),

		notif_running: readOnly( "notification.running" ),
		notif_error  : readOnly( "notification.error" ),

		scope: function() {
			return get( this, "auth.session.scope" ).split( "+" ).join( ", " );
		}.property( "auth.session.scope" ),

		showTokenForm: false,

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

			"copyToken": function( success, failure ) {
				var token = get( this, "auth.session.access_token" );
				var cb = nwGui.Clipboard.get();

				if ( token && cb ) {
					cb.set( token, "text" );

					if ( success instanceof Function ) {
						success();
					}
				} else if ( failure instanceof Function ) {
					failure().catch();
				}
			},

			"showTokenForm": function() {
				set( this, "showTokenForm", true );
			}
		}
	});

});
