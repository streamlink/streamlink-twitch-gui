import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";
import { name } from "utils/decorators";


@name( "kraken/search/channels" )
export default class TwitchSearchChannel extends Model {
	/** @type {TwitchChannel} */
	@belongsTo( "twitch-channel", { async: false } )
	channel;
}
