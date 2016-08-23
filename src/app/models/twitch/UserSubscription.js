import {
	attr,
	Model
} from "EmberData";


export default Model.extend({
	// pass through: don't update the channel record
	channel   : attr(),
	created_at: attr( "date" )

}).reopenClass({
	toString() { return "kraken/users/:user/subscriptions"; }
});
