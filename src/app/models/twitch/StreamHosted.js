import {
	attr,
	belongsTo,
	Model
} from "ember-data";


export default Model.extend({
	display_name: attr( "string" ),
	name: attr( "string" ),
	// always side-load the target relation
	target: belongsTo( "twitchStream", { async: true } )

}).reopenClass({
	toString() { return "api/users/:user_name/followed/hosting"; }
});
