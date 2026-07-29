import Route from "@ember/routing/route";


export default Route.extend({
	beforeModel( transition ) {
		// access to this route is restricted
		// but don't block the initial transition
		if ( transition.sequence > 0 ) {
			transition.abort();
		}
	}
});
