import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";


export default Model.extend( /** @class TwitchGameTop */ {
	/** @type {TwitchGame} */
	game: belongsTo( "twitch-game", { async: false } )

}).reopenClass({
	toString() { return "helix/games/top"; }
});
