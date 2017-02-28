import {
	attr,
	Model
} from "EmberData";


export default Model.extend({
	created_at: attr( "date" )

}).reopenClass({
	toString() { return "kraken/users/:user_id/follows/channels"; }
});
