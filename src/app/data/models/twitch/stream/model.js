import { get, computed } from "@ember/object";
import { inject as service } from "@ember/service";
import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";
import { DEFAULT_VODCAST_REGEXP } from "data/models/settings/streams/fragment";
import { getChannelSettings } from "data/models/twitch/user/model";


const reLang = /^([a-z]{2})(:?-([a-z]{2}))?$/;


// noinspection JSValidateTypes
export default Model.extend( /** @class TwitchStream */ {
	/** @type {IntlService} */
	intl: service(),
	/** @type {SettingsService} */
	settings: service(),

	/** @type {TwitchUser} */
	user: belongsTo( "twitch-user", { async: true } ),
	/** @type {TwitchChannel} */
	channel: belongsTo( "twitch-channel", { async: true } ),
	/** @type {TwitchGame} */
	game: belongsTo( "twitch-game", { async: true } ),

	// "user_id" is already defined as the primaryKey of TwitchStream
	// accessing the record's "user_id" can be done via "record.id"
	/** @type {string} */
	user_login: attr( "string" ),
	/** @type {string} */
	user_name: attr( "string" ),
	/** @type {string} */
	game_id: attr( "string" ),
	/** @type {string} */
	game_name: attr( "string" ),
	/** @type {string} */
	type: attr( "string" ),
	/** @type {string} */
	title: attr( "string" ),
	/** @type {number} */
	viewer_count: attr( "number" ),
	/** @type {Date} */
	started_at: attr( "date" ),
	/** @type {string} */
	language: attr( "string" ),
	/** @type {TwitchImage} */
	thumbnail_url: attr( "twitch-image", { width: 640, height: 360 } ),
	/** @type {boolean} */
	is_mature: attr( "boolean" ),


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

			return new Date() - started_at < 24 * 3600 * 1000
				? this.intl.t( "models.twitch.stream.started-at.less-than-24h", { started_at } )
				: this.intl.t( "models.twitch.stream.started-at.more-than-24h", { started_at } );
		}
	),

	/** @type {string} */
	titleViewers: computed(
		"intl.locale",
		"viewer_count",
		/** @this {TwitchStream} */
		function() {
			return this.intl.t( "models.twitch.stream.viewer_count", { count: this.viewer_count } );
		}
	),

	/** @type {boolean} */
	hasLanguage: computed(
		"language",
		/** @this {TwitchStream} */
		function() {
			const { language } = this;

			return !!language && language !== "other";
		}
	),

	/** @type {boolean} */
	hasBroadcasterLanguage: computed(
		"language",
		"channel.broadcaster_language",
		/** @this {TwitchStream} */
		function() {
			const { language } = this;
			// Ember.get() required here for ObjectProxy access
			const broadcaster_language = get( this, "channel.broadcaster_language" );

			const mLanguage = reLang.exec( language );
			const mBroadcaster = reLang.exec( broadcaster_language );

			// show the broadcaster_language only if it is set and
			// 1. the language is not set or
			// 2. the language differs from the broadcaster_language
			//    WITHOUT comparing both lang variants
			return !!mBroadcaster && ( !mLanguage || mLanguage[ 1 ] !== mBroadcaster[ 1 ] );
		}
	),

	/**
	 * Load channel specific settings (without loading the TwitchUser belongsTo relationship)
	 * @returns {Promise<Object>}
	 */
	async getChannelSettings() {
		const { store, id } = this;

		return await getChannelSettings( store, id );
	}

}).reopenClass({
	toString() { return "helix/streams"; }
});
