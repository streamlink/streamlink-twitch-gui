import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";
import { name } from "utils/decorators";


@name( "kraken/streams/featured" )
export default class TwitchStreamFeatured extends Model {
	@attr( "string" )
	image;
	@attr( "number" )
	priority;
	@attr( "boolean" )
	scheduled;
	@attr( "boolean" )
	sponsored;
	/** @type {TwitchStream} */
	@belongsTo( "twitch-stream", { async: false } )
	stream;
	@attr( "string" )
	text;
	@attr( "string" )
	title;
}
