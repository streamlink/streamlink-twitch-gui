import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";
import { name } from "utils/decorators";


@name( "kraken/games/top" )
export default class TwitchGameTop extends Model {
	@attr( "number" )
	channels;
	/** @type {TwitchGame} */
	@belongsTo( "twitch-game", { async: false } )
	game;
	@attr( "number" )
	viewers;
}
