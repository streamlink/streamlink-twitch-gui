import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";


export default Model.extend( /** @class TwitchUserFollowed */ {
	/** @type {TwitchUser} */
	from: belongsTo( "twitch-user", { async: true } ),
	/** @type {TwitchUser} */
	to: belongsTo( "twitch-user", { async: true } ),
	/** @type {Date} */
	followed_at: attr( "date" )

}).reopenClass({
	toString() { return "helix/users/follows"; }
});
