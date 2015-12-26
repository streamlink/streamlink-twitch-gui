define( [ "Ember" ], function( Ember ) {

	var get = Ember.get;

	return Ember.Route.extend({
		auth: Ember.inject.service(),

		disableAutoRefresh: true,

		beforeModel: function( transition ) {
			// check if user is successfully logged in
			if ( get( this, "auth.session.isLoggedIn" ) ) {
				transition.abort();
				this.transitionTo( "user.index" );
			}
		},

		actions: {
			willTransition: function() {
				var win = get( this, "auth.window" );
				if ( win ) {
					win.close();
				}
				this.controller.resetProperties();
			}
		}
	});

});
