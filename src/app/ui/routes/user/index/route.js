import { set } from "@ember/object";
import { addListener, removeListener } from "@ember/object/events";
import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";


export default class UserIndexRoute extends Route {
	/** @type {AuthService} */
	@service auth;
	/** @type {RouterService} */
	@service router;

	beforeModel( transition ) {
		/** @type {Auth} */
		const session = this.auth.session;

		// check if user is successfully logged in
		if ( session && session.isLoggedIn ) { return; }

		transition.abort();
		this._transition = transition;

		// Auth record not yet loaded?
		if ( !session ) {
			addListener( this.auth, "initialized", this, "_waitForLogin", true );
		} else {
			this._waitForLogin();
		}
	}

	_redirectToLoginForm() {
		const controller = this.controllerFor( "userAuth" );
		set( controller, "previousTransition", this._transition );
		this.router.transitionTo( "user.auth" );
	}

	_waitForLogin() {
		// no ongoing login? prompt user to log in.
		if ( !this.auth.session.isPending ) {
			return this._redirectToLoginForm();
		}

		// show loading screen
		this.intermediateTransitionTo( "loading" );

		// remove onLogin listener if the user attempts to leave the current route early
		addListener( this.router, "routeWillChange", this, "_removeOnLoginListener", true );

		// register callback once
		addListener( this.auth, "login", this, "_onLogin", true );
	}

	_removeOnLoginListener() {
		removeListener( this.auth, "login", this, "_onLogin" );
	}

	_onLogin( success ) {
		this._removeOnLoginListener();
		if ( success ) {
			// send the user back to the original route
			this._transition.retry();
		} else {
			this._redirectToLoginForm();
		}
	}
}
