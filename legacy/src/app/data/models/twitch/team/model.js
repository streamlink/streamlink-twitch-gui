import { computed } from "@ember/object";
import attr from "ember-data/attr";
import Model from "ember-data/model";


// noinspection JSValidateTypes
export default Model.extend( /** @class TwitchTeam */ {
	// Avoid defining hasMany relationships:
	// We want to query the Twitch{Stream,User} data ourselves in the Team{Index,Members}Route,
	// so we can query the API in chunks via the infinite scroll mechanism.
	// The TwitchTeamSerializer will turn the "users" payload property into a list of user IDs.
	/** @type {string[]} */
	users: attr(),

	/** @type {string} */
	background_image_url: attr( "string" ),
	/** @type {string} */
	banner: attr( "string" ),
	/** @type {Date} */
	created_at: attr( "date" ),
	/** @type {Date} */
	updated_at: attr( "date" ),
	/** @type {string} */
	info: attr( "string" ),
	/** @type {string} */
	thumbnail_url: attr( "string" ),
	/** @type {string} */
	team_name: attr( "string" ),
	/** @type {string} */
	team_display_name: attr( "string" ),


	/** @type {string} */
	title: computed(
		"team_name",
		"team_display_name",
		/** @this {TwitchTeam} */
		function() {
			return this.team_display_name || this.team_name;
		}
	)

}).reopenClass({
	toString() { return "helix/teams"; }
});
