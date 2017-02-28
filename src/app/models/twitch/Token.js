import {
	attr,
	Model
} from "EmberData";


/**
 * @class TwitchToken
 * @extends Model
 */
export default Model.extend({
	authorization: attr(),
	user_id: attr( "number" ),
	user_name: attr( "string" ),
	valid: attr( "boolean" )

}).reopenClass({
	toString() { return "kraken/"; }
});
