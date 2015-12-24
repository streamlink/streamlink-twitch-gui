define( [ "Ember", "nwjs/nwGui" ], function( Ember, nwGui ) {

	var get = Ember.get;
	var set = Ember.set;

	return Ember.Controller.extend({
		auth        : Ember.inject.service(),
		notification: Ember.inject.service(),
		settings    : Ember.inject.service(),

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
