import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";


export default Model.extend({
	channel: belongsTo( "twitchChannel", { async: false } ),
	created_at: attr( "date" ),
	notifications: attr( "boolean" )

}).reopenClass({
	toString() { return "kraken/users/:user_id/follows/channels"; }
});
