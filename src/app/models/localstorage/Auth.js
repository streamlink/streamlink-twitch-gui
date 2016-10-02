import {
	get,
	computed
} from "Ember";
import {
	attr,
	Model
} from "EmberData";


export default Model.extend({
	access_token: attr( "string" ),
	scope       : attr( "string" ),
	date        : attr( "date" ),


	// volatile property
	user_name : null,

	// status properties
	isPending : false,
	isLoggedIn: computed( "access_token", "user_name", "isPending", function() {
		let token   = get( this, "access_token" );
		let name    = get( this, "user_name" );
		let pending = get( this, "isPending" );

		return token && name && !pending;
	})

}).reopenClass({
	toString() { return "Auth"; }
});
