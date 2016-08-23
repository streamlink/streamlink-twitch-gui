import {
	attr,
	belongsTo,
	Model
} from "EmberData";


export default Model.extend({
	display_name: attr( "string" ),
	name: attr( "string" ),
	// always side-load the target relation
	target: belongsTo( "twitchStream", { async: true } )

}).reopenClass({
	toString: function() { return "api/users/:user/followed/hosting"; }
});
