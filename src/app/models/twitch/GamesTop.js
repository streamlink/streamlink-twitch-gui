import DS from "EmberData";


var attr = DS.attr;
var belongsTo = DS.belongsTo;


export default DS.Model.extend({
	channels: attr( "number" ),
	game: belongsTo( "twitchGame", { async: false } ),
	viewers: attr( "number" )

}).reopenClass({
	toString: function() { return "kraken/games/top"; }
});
