import {
	attr,
	belongsTo,
	Model
} from "EmberData";


export default Model.extend({
	channel: belongsTo( "twitchChannel", { async: false } ),
	created_at: attr( "date" ),
	notifications: attr( "boolean" )

}).reopenClass({
	toString: function() { return "kraken/users/:user/follows/channels"; }
});
