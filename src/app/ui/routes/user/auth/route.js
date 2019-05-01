import { action } from "@ember/object";
import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";


export default class UserAuthRoute extends Route {
	/** @type {AuthService} */
	@service auth;
	/** @type {RouterService} */
	@service router;

	beforeModel( transition ) {
		/** @type {Auth} */
		const session = this.auth.session;

		// check if user is successfully logged in
		if ( session && session.isLoggedIn ) {
			transition.abort();
			this.router.transitionTo( "user.index" );
		}
	}

	@action
	willTransition() {
		this.controller.send( "abort" );
		this.controller.resetProperties();
	}
}
