import {
	belongsTo,
	Model
} from "ember-data";


export default Model.extend({
	game: belongsTo( "twitchGame", { async: false } )

}).reopenClass({
	toString() { return "kraken/search/games"; }
});
