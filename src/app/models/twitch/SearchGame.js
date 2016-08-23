import {
	belongsTo,
	Model
} from "EmberData";


export default Model.extend({
	game: belongsTo( "twitchGame", { async: false } )

}).reopenClass({
	toString: function() { return "kraken/search/games"; }
});
