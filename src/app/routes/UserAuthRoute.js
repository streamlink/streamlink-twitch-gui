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
				this.controller.send( "abort" );
				this.controller.resetProperties();
			}
		}
	});

});
