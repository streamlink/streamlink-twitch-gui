import DS from "EmberData";


var belongsTo = DS.belongsTo;


export default DS.Model.extend({
	game: belongsTo( "twitchGame", { async: false } )

}).reopenClass({
	toString: function() { return "kraken/search/games"; }
});
