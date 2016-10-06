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
	background: attr( "string" ),
	banner: attr( "string" ),
	broadcaster_language: attr( "string" ),
	created_at: attr( "date" ),
	delay: attr( "number" ),
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
	staff: attr( "boolean" ),
	status: attr( "string" ),
	//teams: hasMany( "twitchTeam" ),
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


	title_followers: computed( "followers", function() {
		var followers = get( this, "followers" );
		var numerus   = followers === 1 ? " person is following" : " people are following";
		return followers + numerus;
	}),

	title_views: computed( "views", function() {
		var views   = get( this, "views" );
		var numerus = views === 1 ? " channel view" : " channel views";
		return views + numerus;
	}),


	has_language: computed( "language", function() {
		var lang = get( this, "language" );
		return lang && lang !== "other";
	}),

	has_broadcaster_language: computed( "broadcaster_language", "language", function() {
		var broadcaster  = get( this, "broadcaster_language" );
		var language     = get( this, "language" );
		var mBroadcaster = reLang.exec( broadcaster );
		var mLanguage    = reLang.exec( language );
		// show the broadcaster_language only if it is set and
		// 1. the language is not set or
		// 2. the language is different from the broadcaster_language
		//    WITHOUT comparing both lang variants
		return mBroadcaster && ( !mLanguage || mLanguage[1] !== mBroadcaster[1] );
	}),


	/** @type {(TwitchUserSubscription|boolean)} subscribed */
	subscribed: null,

	/** @type {(TwitchUserFollowsChannel|boolean)} following */
	followed  : null

}).reopenClass({
	toString() { return "kraken/channels"; }
});
