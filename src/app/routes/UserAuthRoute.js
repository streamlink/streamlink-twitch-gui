import { get } from "@ember/object";
import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";


export default Route.extend({
	auth: service(),

	beforeModel( transition ) {
		// check if user is successfully logged in
		if ( get( this, "auth.session.isLoggedIn" ) ) {
			transition.abort();
			this.transitionTo( "user.index" );
		}
	},

	actions: {
		willTransition() {
			this.controller.send( "abort" );
			this.controller.resetProperties();
		}
	}
});
