import Controller from "@ember/controller";
import { set } from "@ember/object";


export default Controller.extend({
	queryParams: [ "sortby", "direction" ],

	sortby   : "created_at",
	direction: "desc",

	actions: {
		sortMethod( sortby ) {
			set( this, "sortby", sortby );
		},

		sortOrder( direction ) {
			set( this, "direction", direction );
		}
	}
});
