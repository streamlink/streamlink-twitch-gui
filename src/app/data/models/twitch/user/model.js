import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";
import {
	ATTR_STREAMS_NAME_CUSTOM,
	ATTR_STREAMS_NAME_ORIGINAL,
	ATTR_STREAMS_NAME_BOTH
} from "data/models/settings/streams/fragment";


/**
 * @param {DS.Store} store
 * @param {string} id
 * @return {Promise<Object>}
 */
export async function getChannelSettings( store, id ) {
	/** @type {ChannelSettings|DS.Model} */
	let record;
	try {
		record = await store.findRecord( "channel-settings", id );
	} catch ( e ) {
		record = await store.recordForId( "channel-settings", id );
	}

	const data = record.toJSON();
	store.unloadRecord( record );

	return data;
}


// noinspection JSValidateTypes
export default Model.extend( /** @class TwitchUser */ {
	/** @type {IntlService} */
	intl: service(),
	/** @type {SettingsService} */
	settings: service(),

	/** @type {TwitchChannel} */
	channel: belongsTo( "twitch-channel", { async: true } ),
	/** @type {TwitchStream} */
	stream: belongsTo( "twitch-stream", { async: true, inverse: null } ),

	/** @type {string} */
	broadcaster_type: attr( "string" ),
	/** @type {string} */
	description: attr( "string" ),
	/** @type {string} */
	display_name: attr( "string" ),
	/** @type {string} */
	login: attr( "string" ),
	/** @type {string} */
	offline_image_url: attr( "string" ),
	/** @type {string} */
	profile_image_url: attr( "string" ),
	/** @type {string} */
	type: attr( "string" ),
	/** @type {number} */
	view_count: attr( "number" ),
	/** @type {Date} */
	created_at: attr( "date" ),


	/** @type {boolean} */
	isPartner: computed(
		"broadcaster_type",
		/** @this {TwitchUser} */
		function() {
			const { broadcaster_type } = this;

			return broadcaster_type === "partner" || broadcaster_type === "affiliate";
		}
	),

	/** @type {boolean} */
	hasCustomDisplayName: computed(
		"login",
		"display_name",
		/** @this {TwitchUser} */
		function() {
			// in case this computed property was accessed via TwitchStream before its
			// TwitchUser relationship promise was resolved, login and display_name will be null
			return String( this.login ).toLowerCase() !== String( this.display_name ).toLowerCase();
		}
	),

	/** @type {string} */
	detailedName: computed(
		"login",
		"display_name",
		"hasCustomDisplayName",
		"settings.content.streams.name",
		/** @this {TwitchUser} */
		function() {
			switch ( this.settings.content.streams.name ) {
				case ATTR_STREAMS_NAME_CUSTOM:
					return this.display_name;
				case ATTR_STREAMS_NAME_ORIGINAL:
					return this.login;
				case ATTR_STREAMS_NAME_BOTH:
					return this.hasCustomDisplayName
						? `${this.display_name} (${this.login})`
						: this.display_name;
				default:
					return this.display_name;
			}
		}
	),

	/** @type {string} */
	titleViewCount: computed(
		"intl.locale",
		"view_count",
		/** @this {TwitchUser} */
		function() {
			return this.intl.t( "models.twitch.user.view_count", { count: this.view_count } );
		}
	),

	/**
	 * Load channel specific settings
	 * @returns {Promise<Object>}
	 */
	async getChannelSettings() {
		const { store, id } = this;

		return await getChannelSettings( store, id );
	}

}).reopenClass({
	toString() { return "helix/users"; }
});
