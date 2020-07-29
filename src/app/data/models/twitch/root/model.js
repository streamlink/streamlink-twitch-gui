import attr from "ember-data/attr";
import Model from "ember-data/model";
import { array } from "ember-data-model-fragments/attributes";


/**
 * @class TwitchRoot
 * @extends Model
 */
export default Model.extend({
	created_at: attr( "date" ),
	scopes: array( "string" ),
	updated_at: attr( "date" ),
	user_id: attr( "number" ),
	user_name: attr( "string" ),
	valid: attr( "boolean" )

}).reopenClass({
	toString() { return "kraken/"; }
});
