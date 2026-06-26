import attr from "ember-data/attr";
import Model from "ember-data/model";


export default Model.extend( /** @class TwitchSubscription */ {
	/** @type {string} */
	broadcaster_id: attr( "string" ),
	/** @type {string} */
	broadcaster_login: attr( "string" ),
	/** @type {string} */
	broadcaster_name: attr( "string" ),
	/** @type {string} */
	user_id: attr( "string" ),
	/** @type {boolean} */
	is_gift: attr( "boolean" ),
	/** @type {string} */
	tier: attr( "string" )

}).reopenClass({
	toString() { return "helix/subscriptions/user"; }
});
