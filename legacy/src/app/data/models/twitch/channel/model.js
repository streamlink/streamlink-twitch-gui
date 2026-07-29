import attr from "ember-data/attr";
import Model from "ember-data/model";


// noinspection JSValidateTypes
export default Model.extend( /** @class TwitchChannel */ {
	/** @type {string} */
	broadcaster_language: attr( "string" ),
	/** @type {number} */
	delay: attr( "number" )

}).reopenClass({
	toString() { return "helix/channels"; }
});
