import { alias } from "@ember/object/computed";
import {
	attr,
	belongsTo,
	hasMany,
	Model
} from "ember-data";


export default Model.extend({
	emoticons: hasMany( "twitchProductEmoticon", { async: false } ),
	features: attr(),
	interval_number: attr( "number" ),
	owner_name: attr( "string" ),
	partner_login: belongsTo( "twitchUser", { async: true } ),
	period: attr( "string" ),
	price: attr( "string" ),
	recurring: attr( "boolean" ),
	short_name: attr( "string" ),
	ticket_type: attr( "string" ),

	channel: alias( "partner_login.channel" )

}).reopenClass({
	toString() { return "twitchProduct"; }
});
