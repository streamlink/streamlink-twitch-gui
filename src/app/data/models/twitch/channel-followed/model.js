import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";
import { name } from "utils/decorators";


@name( "kraken/users/:user_id/follows/channels" )
export default class TwitchChannelFollowed extends Model {
	/** @type {TwitchChannel} */
	@belongsTo( "twitch-channel", { async: false } )
	channel;
	@attr( "date" )
	created_at;
	@attr( "boolean" )
	notifications;
}
