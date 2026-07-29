import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";


export default Model.extend( /** @class TwitchChannelsFollowed */ {
	/** @type {TwitchUser} */
	user_id: belongsTo( "twitch-user", { async: true } ),
	/** @type {TwitchUser} */
	broadcaster_id: belongsTo( "twitch-user", { async: true } ),
	/** @type {Date} */
	followed_at: attr( "date" )

}).reopenClass({
	toString() { return "helix/channels/followed"; }
});
