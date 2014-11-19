define( [ "ember" ], function( Ember ) {

	return Ember.Route.extend({
		beforeModel: function( transition ) {
			var	self = this,
				authController = self.controllerFor( "userAuth" );

			function login_fail() {
				authController.set( "previousTransition", transition );
				self.transitionTo( "user.auth" );
			}

			// check if user is successfully logged in
			if ( !self.auth.get( "isLoggedIn" ) ) {
				transition.abort();

				// pending login?
				if ( !self.auth.get( "isPending" ) ) {
					// send user directly to login form
					login_fail();

				} else {
					// set the callback
					self.onLogin = function( success ) {
						if ( success ) {
							// send user back to original route
							transition.retry();
						} else {
							// send user to login form
							login_fail();
						}
						// event has fired, now remove callback reference
						delete self.onLogin;
					};

					// show loading screen
					this.intermediateTransitionTo( "loading" );

					// unregister onLogin callback when the user switches the route
					// before the callback has fired
					self.router.one( "didTransition", function() {
						if ( self.onLogin ) {
							authController.off( "login", self, self.onLogin );
							delete self.onLogin;
						}
					});

					// register callback once
					authController.one( "login", self, self.onLogin );
				}
			}
		}
	});

});
