import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";


export default Model.extend( /** @class TwitchSearchGame */ {
	/** @type {TwitchGame} */
	game: belongsTo( "twitch-game", { async: false } )

}).reopenClass({
	toString() { return "helix/search/categories"; }
});
