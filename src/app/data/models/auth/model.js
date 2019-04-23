import { computed } from "@ember/object";
import attr from "ember-data/attr";
import Model from "ember-data/model";
import { name } from "utils/decorators";


@name( "Auth" )
export default class Auth extends Model {
	@attr( "string" )
	access_token;
	@attr( "string" )
	scope;
	@attr( "date" )
	date;


	// runtime "attributes"
	user_id = null;
	user_name = null;

	// status properties
	isPending = false;

	@computed( "access_token", "user_id", "isPending" )
	get isLoggedIn() {
		return this.access_token && this.user_id && !this.isPending;
	}
}
