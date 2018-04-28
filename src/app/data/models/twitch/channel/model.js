import { get, computed } from "@ember/object";
import { inject as service } from "@ember/service";
import attr from "ember-data/attr";
import Model from "ember-data/model";
import {
	ATTR_STREAMS_NAME_CUSTOM,
	ATTR_STREAMS_NAME_ORIGINAL,
	ATTR_STREAMS_NAME_BOTH
} from "data/models/settings/streams/fragment";


const reLang = /^([a-z]{2})(:?-([a-z]{2}))?$/;


export default Model.extend({
	i18n: service(),
	settings: service(),


	broadcaster_language: attr( "string" ),
	created_at: attr( "date" ),
	display_name: attr( "string" ),
	followers: attr( "number" ),
	game: attr( "string" ),
	language: attr( "string" ),
	logo: attr( "string" ),
	mature: attr( "boolean" ),
	name: attr( "string" ),
	partner: attr( "boolean" ),
	profile_banner: attr( "string" ),
	profile_banner_background_color: attr( "string" ),
	status: attr( "string" ),
	updated_at: attr( "date" ),
	url: attr( "string" ),
	video_banner: attr( "string" ),
	views: attr( "number" ),


	hasCustomDisplayName: computed( "name", "display_name", function() {
		return get( this, "name" ).toLowerCase() !== get( this, "display_name" ).toLowerCase();
	}),

	detailedName: computed(
		"name",
		"display_name",
		"hasCustomDisplayName",
		"settings.streams.name",
		function() {
			switch ( get( this, "settings.streams.name" ) ) {
				case ATTR_STREAMS_NAME_CUSTOM:
					return get( this, "display_name" );
				case ATTR_STREAMS_NAME_ORIGINAL:
					return get( this, "name" );
				case ATTR_STREAMS_NAME_BOTH:
					return get( this, "hasCustomDisplayName" )
						? `${get( this, "display_name" )} (${get( this, "name" )})`
						: get( this, "display_name" );
			}
		}
	),


	titleFollowers: computed( "i18n.locale", "followers", function() {
		const i18n = get( this, "i18n" );
		const count = get( this, "followers" );

		return i18n.t( "models.twitch.channel.followers", { count } );
	}),

	titleViews: computed( "i18n.locale", "views", function() {
		const i18n = get( this, "i18n" );
		const count = get( this, "views" );

		return i18n.t( "models.twitch.channel.views", { count } );
	}),


	hasLanguage: computed( "language", function() {
		const lang = get( this, "language" );

		return !!lang && lang !== "other";
	}),

	hasBroadcasterLanguage: computed( "broadcaster_language", "language", function() {
		const broadcaster = get( this, "broadcaster_language" );
		const language = get( this, "language" );
		const mBroadcaster = reLang.exec( broadcaster );
		const mLanguage = reLang.exec( language );

		// show the broadcaster_language only if it is set and
		// 1. the language is not set or
		// 2. the language is different from the broadcaster_language
		//    WITHOUT comparing both lang variants
		return !!mBroadcaster && ( !mLanguage || mLanguage[1] !== mBroadcaster[1] );
	}),


	/** @type {(TwitchSubscription|boolean)} subscribed */
	subscribed: null,

	/** @type {(TwitchChannelFollowed|boolean)} following */
	followed: null,

	/**
	 * Load channel specific settings
	 * @returns {Promise<Object>}
	 */
	getChannelSettings() {
		const store = get( this, "store" );
		const id = get( this, "name" );

		// For a very weird reason, exceptions thrown by store.findRecord() are not being caught
		// when using an async function and a try/catch block with the await keyword.
		// So use a regular promise chain here instead.
		return store.findRecord( "channelSettings", id )
			.catch( () => store.recordForId( "channelSettings", id ) )
			.then( record => {
				// get the record's data and then unload it
				const data = record.toJSON();
				store.unloadRecord( record );

				return data;
			});
	}

}).reopenClass({
	toString() { return "kraken/channels"; }
});
