import attr from "ember-data/attr";
import Model from "ember-data/model";


// noinspection JSValidateTypes
export default Model.extend( /** @class TwitchGame */ {
	/** @type {TwitchImage} */
	box_art_url: attr( "twitch-image", { width: 285, height: 380, expiration: 0 } ),
	/** @type {string} */
	name: attr( "string" )

}).reopenClass({
	toString() { return "helix/games"; }
});
