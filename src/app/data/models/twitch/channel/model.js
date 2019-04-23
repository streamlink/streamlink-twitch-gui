import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import attr from "ember-data/attr";
import Model from "ember-data/model";
import {
	ATTR_STREAMS_NAME_CUSTOM,
	ATTR_STREAMS_NAME_ORIGINAL,
	ATTR_STREAMS_NAME_BOTH
} from "data/models/settings/streams/fragment";
import { name } from "utils/decorators";


const reLang = /^([a-z]{2})(:?-([a-z]{2}))?$/;


@name( "kraken/channels" )
export default class TwitchChannel extends Model {
	/** @type {I18nService} */
	@service i18n;
	/** @type {SettingsService} */
	@service settings;


	@attr( "string" )
	broadcaster_language;
	@attr( "date" )
	created_at;
	@attr( "string" )
	display_name;
	@attr( "number" )
	followers;
	@attr( "string" )
	game;
	@attr( "string" )
	language;
	@attr( "string" )
	logo;
	@attr( "boolean" )
	mature;
	@attr( "string" )
	name;
	@attr( "boolean" )
	partner;
	@attr( "string" )
	profile_banner;
	@attr( "string" )
	profile_banner_background_color;
	@attr( "string" )
	status;
	@attr( "date" )
	updated_at;
	@attr( "string" )
	url;
	@attr( "string" )
	video_banner;
	@attr( "number" )
	views;


	/** @type {(TwitchSubscription|boolean)} subscribed */
	subscribed = null;

	/** @type {(TwitchChannelFollowed|boolean)} following */
	followed = null;


	@computed( "name", "display_name" )
	get hasCustomDisplayName() {
		return this.name.toLowerCase() !== this.display_name.toLowerCase();
	}

	@computed(
		"name",
		"display_name",
		"hasCustomDisplayName",
		"settings.content.streams.name"
	)
	get detailedName() {
		switch ( this.settings.content.streams.name ) {
			case ATTR_STREAMS_NAME_ORIGINAL:
				return this.name;
			case ATTR_STREAMS_NAME_BOTH:
				return this.hasCustomDisplayName
					? `${this.display_name} (${this.name})`
					: this.display_name;
			case ATTR_STREAMS_NAME_CUSTOM:
			default:
				return this.display_name;
		}
	}


	@computed( "i18n.locale", "followers" )
	get titleFollowers() {
		return this.i18n.t( "models.twitch.channel.followers", { count: this.followers } );
	}

	@computed( "i18n.locale", "views" )
	get titleViews() {
		return this.i18n.t( "models.twitch.channel.views", { count: this.views } );
	}


	@computed( "language" )
	get hasLanguage() {
		const language = this.language;

		return !!language && language !== "other";
	}

	@computed( "broadcaster_language", "language" )
	get hasBroadcasterLanguage() {
		const { broadcaster_language, language } = this;
		const mBroadcaster = reLang.exec( broadcaster_language );
		const mLanguage = reLang.exec( language );

		// show the broadcaster_language only if it is set and
		// 1. the language is not set or
		// 2. the language is different from the broadcaster_language
		//    WITHOUT comparing both lang variants
		return !!mBroadcaster && ( !mLanguage || mLanguage[1] !== mBroadcaster[1] );
	}

	/**
	 * Load channel specific settings
	 * @returns {Promise<ChannelSettings>}
	 */
	getChannelSettings() {
		const store = this.store;
		const name = this.name;

		// For a very weird reason, exceptions thrown by store.findRecord() are not being caught
		// when using an async function and a try/catch block with the await keyword.
		// So use a regular promise chain here instead.
		return store.findRecord( "channel-settings", name )
			.catch( () => store.recordForId( "channel-settings", name ) )
			.then( record => {
				// get the record's data and then unload it
				const data = record.toJSON();
				store.unloadRecord( record );

				return data;
			});
	}
}
