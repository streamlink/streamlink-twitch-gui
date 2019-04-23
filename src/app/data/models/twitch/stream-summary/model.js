import attr from "ember-data/attr";
import Model from "ember-data/model";
import { name } from "utils/decorators";


@name( "kraken/streams/summary" )
export default class TwitchStreamSummary extends Model {
	@attr( "number" )
	channels;
	@attr( "number" )
	viewers;
}
