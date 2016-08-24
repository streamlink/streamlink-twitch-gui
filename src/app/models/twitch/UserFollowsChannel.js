import {
	attr,
	Model
} from "EmberData";


export default Model.extend({
	created_at   : attr( "date" ),
	notifications: attr( "boolean" )

}).reopenClass({
	toString() { return "kraken/users/:user/follows/channels"; }
});
