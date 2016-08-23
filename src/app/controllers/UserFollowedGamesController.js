import {
	get,
	set,
	Controller
} from "Ember";


export default Controller.extend({
	queryParams: [ "all" ],

	actions: {
		toggleAll() {
			// query parameters are strings
			set( this, "all", get( this, "all" ) === "true" ? "false" : "true" );
		}
	}
});
