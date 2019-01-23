import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";


export default Route.extend({
	/** @type {RouterService} */
	router: service(),

	beforeModel( transition ) {
		// access to this route is restricted
		// but don't block the initial transition
		if ( transition.sequence > 0 ) {
			transition.abort();
		}
	},

	actions: {
		didTransition() {
			this.router.homepage( true );
		}
	}
});
