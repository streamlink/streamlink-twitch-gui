import { get } from "Ember";
import {
	attr,
	Model
} from "EmberData";


export default Model.extend({
	access_token: attr( "string" ),
	scope       : attr( "string" ),
	date        : attr( "date" ),


	// volatile property
	user_name : null,

	// status properties
	isPending : false,
	isLoggedIn: function() {
		var token   = get( this, "access_token" );
		var name    = get( this, "user_name" );
		var pending = get( this, "isPending" );

		return token && name && !pending;
	}.property( "access_token", "user_name", "isPending" )

}).reopenClass({
	toString() { return "Auth"; }
});
