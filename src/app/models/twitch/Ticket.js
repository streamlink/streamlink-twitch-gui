import {
	attr,
	belongsTo,
	Model
} from "EmberData";


export default Model.extend({
	access_end: attr( "date" ),
	access_start: attr( "date" ),
	product: belongsTo( "twitchProduct", { async: false } ),
	purchase_profile: attr()

}).reopenClass({
	toString() { return "api/users/:user/tickets"; }
});
