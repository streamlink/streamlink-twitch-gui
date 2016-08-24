import DS from "EmberData";


var attr = DS.attr;
var belongsTo = DS.belongsTo;


export default DS.Model.extend({
	access_end: attr( "date" ),
	access_start: attr( "date" ),
	product: belongsTo( "twitchProduct", { async: false } ),
	purchase_profile: attr()

}).reopenClass({
	toString: function() { return "api/users/:user/tickets"; }
});
