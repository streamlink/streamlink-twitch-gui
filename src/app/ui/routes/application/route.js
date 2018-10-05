import { get, set } from "@ember/object";
import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";


export default Route.extend({
	versioncheck: service(),

	init() {
		this._super( ...arguments );
		get( this, "versioncheck" ).check();
	},

	actions: {
		error( error, transition ) {
			transition.abort();
			set( this, "_router.errorTransition", transition );
			return true;
		}
	}
});
