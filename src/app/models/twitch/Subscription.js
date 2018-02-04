import attr from "ember-data/attr";
import Model from "ember-data/model";


export default Model.extend({
	//channel: belongsTo( "twitchChannel" ),
	created_at: attr( "date" )

}).reopenClass({
	toString() { return "kraken/users/:user_id/subscriptions"; }
});
