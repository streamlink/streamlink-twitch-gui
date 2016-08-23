import { Route } from "Ember";


export default Route.extend({
	beforeModel: function( transition ) {
		// access to this route is restricted
		// but don't block the initial transition
		if ( transition.sequence > 0 ) {
			transition.abort();
		}
	},

	actions: {
		"didTransition": function() {
			this.send( "gotoHomepage", true );
		}
	}
});
