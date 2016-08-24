import DS from "EmberData";


var attr = DS.attr;
var belongsTo = DS.belongsTo;
var hasMany = DS.hasMany;


export default DS.Model.extend({
	emoticons: hasMany( "twitchProductEmoticon", { async: false } ),
	features: attr(),
	interval_number: attr( "number" ),
	owner_name: attr( "string" ),
	partner_login: belongsTo( "twitchChannel", { async: true } ),
	period: attr( "string" ),
	price: attr( "string" ),
	recurring: attr( "boolean" ),
	short_name: attr( "string" ),
	ticket_type: attr( "string" )

}).reopenClass({
	toString: function() { return "twitchProduct"; }
});
