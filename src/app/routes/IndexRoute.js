import {
	get,
	inject,
	Route
} from "Ember";


const { service } = inject;


export default Route.extend({
	routing: service( "-routing" ),

	beforeModel( transition ) {
		// access to this route is restricted
		// but don't block the initial transition
		if ( transition.sequence > 0 ) {
			transition.abort();
		}
	},

	actions: {
		didTransition() {
			get( this, "routing" ).homepage( true );
		}
	}
});
