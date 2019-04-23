import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";
import { name } from "utils/decorators";


@name( "kraken/games" )
export default class TwitchGame extends Model {
	/** @type {TwitchImage} */
	@belongsTo( "twitch-image", { async: false } )
	box;
	//@attr( "number" )
	//giantbomb_id;
	/** @type {TwitchImage} */
	@belongsTo( "twitch-image", { async: false } )
	logo;
	@attr( "string" )
	name;
	//@attr( "number" )
	//popularity;
}
