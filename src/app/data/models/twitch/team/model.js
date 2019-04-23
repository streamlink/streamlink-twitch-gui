import { computed } from "@ember/object";
import attr from "ember-data/attr";
import Model from "ember-data/model";
import { hasMany } from "ember-data/relationships";
import { name } from "utils/decorators";


@name( "kraken/teams" )
export default class TwitchTeam extends Model {
	@attr( "string" )
	background;
	@attr( "string" )
	banner;
	@attr( "date" )
	created_at;
	@attr( "string" )
	display_name;
	@attr( "string" )
	info;
	@attr( "string" )
	logo;
	@attr( "string" )
	name;
	@attr( "date" )
	updated_at;
	/** @type {TwitchChannel[]} */
	@hasMany( "twitch-channel", { async: false } )
	users;

	@computed( "name", "display_name" )
	get title() {
		return this.display_name || this.name;
	}
}
