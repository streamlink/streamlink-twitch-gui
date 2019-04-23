import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";
import { name } from "utils/decorators";


/**
 * This model only gets used for mapping channel names to user IDs.
 * Users are looked up via GET /kraken/users?login=:name
 *
 * The primary key is the user/channel name, so it can be looked up via store.findRecord.
 * The original primary key (_id) is used as a key for TwitchChannel/TwitchStream relationships.
 */
@name( "kraken/users" )
export default class TwitchUser extends Model {
	/** @type {PromiseObject<TwitchChannel>} */
	@belongsTo( "twitch-channel", { async: true } )
	channel;
	/** @type {PromiseObject<TwitchStream>} */
	@belongsTo( "twitch-stream", { async: true } )
	stream;
}
