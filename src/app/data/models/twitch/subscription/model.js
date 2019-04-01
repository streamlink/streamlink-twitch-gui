import attr from "ember-data/attr";
import Model from "ember-data/model";


export default Model.extend({
	//channel: belongsTo( "twitchChannel" ),
	//is_gift: attr( "boolean" ),
	//sender: attr( "number or string???" ),
	//sub_plan: attr( "string" ),
	created_at: attr( "date" )

}).reopenClass({
	toString() { return "kraken/users/:user_id/subscriptions"; }
});
