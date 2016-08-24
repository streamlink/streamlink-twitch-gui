import {
	get,
	inject,
	Route
} from "Ember";


const { service } = inject;


export default Route.extend({
	auth: service(),

	disableAutoRefresh: true,

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
