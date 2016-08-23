import {
	set,
	Controller
} from "Ember";


export default Controller.extend({
	queryParams: [ "sortby", "direction" ],

	sortby   : "created_at",
	direction: "desc",

	actions: {
		"sortMethod": function( sortby ) {
			set( this, "sortby", sortby );
		},

		"sortOrder": function( direction ) {
			set( this, "direction", direction );
		}
	}
});
