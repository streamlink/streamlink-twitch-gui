import DS from "EmberData";


var attr = DS.attr;
var belongsTo = DS.belongsTo;


export default DS.Model.extend({
	channel: belongsTo( "twitchChannel", { async: false } ),
	created_at: attr( "date" ),
	notifications: attr( "boolean" )

}).reopenClass({
	toString: function() { return "kraken/users/:user/follows/channels"; }
});
