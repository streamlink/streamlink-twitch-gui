import attr from "ember-data/attr";
import Model from "ember-data/model";


// noinspection JSValidateTypes
export default Model.extend( /** @class TwitchGame */ {
	/** @type {string} */
	box_art_url: attr( "string" ),
	/** @type {string} */
	name: attr( "string" )

}).reopenClass({
	toString() { return "helix/games"; }
});
