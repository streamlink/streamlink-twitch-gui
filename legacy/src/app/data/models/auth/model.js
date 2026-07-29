import { computed } from "@ember/object";
import attr from "ember-data/attr";
import Model from "ember-data/model";


// noinspection JSValidateTypes
export default Model.extend( /** @class Auth */ {
	/** @type {string} */
	access_token: attr( "string" ),
	/** @type {string} */
	scope: attr( "string" ),
	/** @type {Date} */
	date: attr( "date" ),


	// state properties
	user_id: null,
	user_name: null,

	isPending: false,
	isLoggedIn: computed( "access_token", "user_id", "isPending", function() {
		/** @this {Auth} */
		const { access_token, user_id, isPending } = this;

		return access_token && user_id && !isPending;
	})

}).reopenClass({
	toString() { return "Auth"; }
});
