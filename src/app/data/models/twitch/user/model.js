import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";


/**
 * This model is only being used for mapping channel names to user IDs.
 * Users are being looked up via GET /kraken/users?login=:name
 *
 * The primary key is the user/channel name, so it can be looked up via store.findRecord.
 * The original primary key (_id) is used as a key for TwitchChannel/TwitchStream relationships.
 */
export default Model.extend({
	channel: belongsTo( "twitchChannel", { async: true } ),
	stream: belongsTo( "twitchStream", { async: true } )

}).reopenClass({
	toString() { return "kraken/users"; }
});
