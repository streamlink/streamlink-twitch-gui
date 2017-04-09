import {
	get,
	set,
	inject,
	Route
} from "ember";


const { service } = inject;


export default Route.extend({
	versioncheck: service(),

	init() {
		this._super( ...arguments );
		get( this, "versioncheck" ).check();
	},

	actions: {
		error( error, transition ) {
			transition.abort();
			set( this, "router.errorTransition", transition );
			return true;
		}
	}
});
