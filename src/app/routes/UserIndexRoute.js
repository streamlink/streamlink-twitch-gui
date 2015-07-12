define( [ "Ember" ], function( Ember ) {

	var get = Ember.get,
	    set = Ember.set;

	return Ember.Route.extend({
		auth: Ember.inject.service(),

		beforeModel: function( transition ) {
			var self = this;
			var auth = get( self, "auth" );

			// check if user is successfully logged in
			if ( get( auth, "session.isLoggedIn" ) ) { return; }

			transition.abort();

			// send user to login form
			function redirect() {
				var controller = self.controllerFor( "userAuth" );
				set( controller, "previousTransition", transition );
				self.transitionTo( "user.auth" );
			}

			function onLogin( success ) {
				if ( success ) {
					// send user back to original route
					transition.retry();
				} else {
					redirect();
				}
			}

			function check() {
				// login not pending?
				if ( !get( auth, "session.isPending" ) ) {
					redirect();
				} else {
					// show loading screen
					self.intermediateTransitionTo( "loading" );

					// unregister onLogin callback as soon as the user switches the route
					// before the callback has fired
					self.router.one( "didTransition", function() {
						auth.off( "login", onLogin );
					});

					// register callback once
					auth.one( "login", onLogin );
				}
			}

			// session record not yet loaded?
			if ( !get( auth, "session" ) ) {
				auth.one( "initialized", check );
			} else {
				check();
			}
		}
	});

});
