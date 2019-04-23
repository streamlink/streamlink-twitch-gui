import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";
import { name } from "utils/decorators";


@name( "kraken/search/games" )
export default class TwitchSearchGame extends Model {
	/** @type {TwitchGame} */
	@belongsTo( "twitch-game", { async: false } )
	game;
}
