import {
	get,
	computed,
	inject
} from "Ember";
import {
	attr,
	Model
} from "EmberData";


const { service } = inject;

const reLang = /^([a-z]{2})(:?-([a-z]{2}))?$/;


export default Model.extend({
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


	settings: service(),


	hasCustomDisplayName: computed( "name", "display_name", function() {
		return get( this, "name" ).toLowerCase() !== get( this, "display_name" ).toLowerCase();
	}),

	detailedName: computed(
		"name",
		"display_name",
		"hasCustomDisplayName",
		"settings.content.channel_name",
		function() {
			switch ( get( this, "settings.content.channel_name" ) ) {
				case 1: return get( this, "display_name" );
				case 2: return get( this, "name" );
				case 3: return get( this, "hasCustomDisplayName" )
					? `${get( this, "display_name" )} (${get( this, "name" )})`
					: get( this, "display_name" );
			}
		}
	),


	titleFollowers: computed( "followers", function() {
		const number = get( this, "followers" );
		const text = number === 1
			? " person is following"
			: " people are following";

		return `${number}${text}`;
	}),

	titleViews: computed( "views", function() {
		const number = get( this, "views" );
		const text = number === 1
			? " channel view"
			: " channel views";

		return `${number}${text}`;
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
	followed: null

}).reopenClass({
	toString() { return "kraken/channels"; }
});
