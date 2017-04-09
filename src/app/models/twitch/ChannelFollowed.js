import {
	attr,
	belongsTo,
	Model
} from "ember-data";


export default Model.extend({
	channel: belongsTo( "twitchChannel", { async: false } ),
	created_at: attr( "date" ),
	notifications: attr( "boolean" )

}).reopenClass({
	toString() { return "kraken/users/:user_id/follows/channels"; }
});
