import {
	attr,
	belongsTo,
	Model
} from "EmberData";


export default Model.extend({
	channels: attr( "number" ),
	game: belongsTo( "twitchGame", { async: false } ),
	viewers: attr( "number" )

}).reopenClass({
	toString: function() { return "kraken/games/top"; }
});
