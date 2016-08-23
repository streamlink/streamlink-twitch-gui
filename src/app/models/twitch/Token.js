import {
	attr,
	Model
} from "EmberData";


export default Model.extend({
	// pass through
	authorization: attr(),
	user_name: attr( "string" ),
	valid: attr( "boolean" )

}).reopenClass({
	toString: function() { return "kraken/"; }
});
