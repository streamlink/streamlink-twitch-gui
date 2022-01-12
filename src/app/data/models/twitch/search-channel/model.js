import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";
import { DEFAULT_VODCAST_REGEXP } from "data/models/settings/streams/fragment";


// noinspection JSValidateTypes
export default Model.extend( /** @class TwitchSearchChannel */ {
	/** @type {IntlService} */
	intl: service(),
	/** @type {SettingsService} */
	settings: service(),

	/** @type {TwitchUser} */
	user: belongsTo( "twitch-user", { async: true } ),
	/** @type {string} */
	broadcaster_language: attr( "string" ),
	/** @type {string} */
	broadcaster_login: attr( "string" ),
	/** @type {string} */
	display_name: attr( "string" ),
	/** @type {string} */
	game: belongsTo( "twitch-game", { async: true } ),
	/** @type {string} */
	game_name: attr( "string" ),
	/** @type {boolean} */
	is_live: attr( "boolean" ),
	/** @type {string} */
	thumbnail_url: attr( "string" ),
	/** @type {string} */
	title: attr( "string" ),
	/** @type {Date} */
	started_at: attr( "date" ),


	/** @type {(null|RegExp)} */
	reVodcast: computed(
		"settings.content.streams.vodcast_regexp",
		/** @this {TwitchStream} */
		function() {
			const vodcast_regexp = this.settings.content.streams.vodcast_regexp;

			if ( vodcast_regexp.length && !vodcast_regexp.trim().length ) {
				return null;
			}
			try {
				return new RegExp( vodcast_regexp || DEFAULT_VODCAST_REGEXP, "i" );
			} catch ( e ) {
				return null;
			}
		}
	),

	/** @type {boolean} */
	isVodcast: computed(
		"reVodcast",
		"title",
		/** @this {TwitchStream} */
		function() {
			const { reVodcast, title } = this;

			return reVodcast && title && reVodcast.test( title );
		}
	),

	/** @type {string} */
	titleStartedAt: computed(
		"intl.locale",
		"started_at",
		/** @this {TwitchStream} */
		function() {
			const { started_at } = this;

			return !started_at
				? this.intl.t(
					"models.twitch.search-channel.started-at.offline"
				)
				: new Date() - started_at < 24 * 3600 * 1000
					? this.intl.t(
						"models.twitch.search-channel.started-at.less-than-24h",
						{ started_at }
					)
					: this.intl.t(
						"models.twitch.search-channel.started-at.more-than-24h",
						{ started_at }
					);
		}
	)

}).reopenClass({
	toString() { return "helix/search/channels"; }
});
