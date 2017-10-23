import {
	get,
	computed
} from "ember";
import {
	attr,
	Model
} from "ember-data";


/**
 * @class Auth
 * @extends Model
 */
export default Model.extend({
	access_token: attr( "string" ),
	scope       : attr( "string" ),
	date        : attr( "date" ),


	// volatile property
	user_id: null,
	user_name: null,

	// status properties
	isPending : false,
	isLoggedIn: computed( "access_token", "user_id", "isPending", function() {
		let token   = get( this, "access_token" );
		let id      = get( this, "user_id" );
		let pending = get( this, "isPending" );

		return token && id && !pending;
	})

}).reopenClass({
	toString() { return "Auth"; }
});
