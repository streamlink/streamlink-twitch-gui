import {
	attr,
	Model
} from "ember-data";


/**
 * @class TwitchRoot
 * @extends Model
 */
export default Model.extend({
	created_at: attr( "date" ),
	scopes: attr( "" ),
	updated_at: attr( "date" ),
	user_id: attr( "number" ),
	user_name: attr( "string" ),
	valid: attr( "boolean" )

}).reopenClass({
	toString() { return "kraken/"; }
});
