import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";
import { name } from "utils/decorators";


@name( "kraken/streams/followed" )
export default class TwitchStreamFollowed extends Model {
	/** @type {TwitchStream} */
	@belongsTo( "twitch-stream", { async: false } )
	stream;
}
