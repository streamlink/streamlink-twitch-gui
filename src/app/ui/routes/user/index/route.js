import { get, set } from "@ember/object";
import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";


export default Route.extend({
	auth: service(),

	beforeModel( transition ) {
		const auth = get( this, "auth" );

		// check if user is successfully logged in
		if ( get( auth, "session.isLoggedIn" ) ) { return; }

		transition.abort();

		// send user to login form
		const redirect = () => {
			const controller = this.controllerFor( "userAuth" );
			set( controller, "previousTransition", transition );
			this.transitionTo( "user.auth" );
		};

		const onLogin = success => {
			if ( success ) {
				// send user back to original route
				transition.retry();
			} else {
				redirect();
			}
		};

		const check = () => {
			// login not pending?
			if ( !get( auth, "session.isPending" ) ) {
				redirect();
			} else {
				// show loading screen
				this.intermediateTransitionTo( "loading" );

				// unregister onLogin callback as soon as the user switches the route
				// before the callback has fired
				this.router.one( "didTransition", function() {
					auth.off( "login", onLogin );
				});

				// register callback once
				auth.one( "login", onLogin );
			}
		};

		// session record not yet loaded?
		if ( !get( auth, "session" ) ) {
			auth.one( "initialized", check );
		} else {
			check();
		}
	}
});
