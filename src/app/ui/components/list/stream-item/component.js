import { get, set, computed } from "@ember/object";
import { alias, and, equal, notEmpty, or } from "@ember/object/computed";
import { on } from "@ember/object/evented";
import { cancel, later } from "@ember/runloop";
import ListItemComponent from "../-list-item/component";
import {
	ATTR_STREAMS_INFO_GAME,
	ATTR_STREAMS_INFO_TITLE
} from "data/models/settings/streams/fragment";
import layout from "./template.hbs";
import "./styles.less";


export default ListItemComponent.extend({
	layout,

	classNameBindings: [
		":stream-item-component",
		"showGame:show-game",
		"settings.content.streams.show_flag:show-flag",
		"settings.content.streams.show_info:show-info",
		"infoGame:info-game",
		"infoTitle:info-title",
		"isFaded:faded",
		"expanded:expanded"
	],

	/** @type {TwitchUser} */
	user: alias( "content.user" ),
	/** @type {TwitchChannel} */
	channel: alias( "content.channel" ),

	expanded: false,
	locked  : false,
	timer   : null,

	showGame: notEmpty( "content.game_id" ),

	infoGame: equal( "settings.content.streams.info", ATTR_STREAMS_INFO_GAME ),
	infoTitle: equal( "settings.content.streams.info", ATTR_STREAMS_INFO_TITLE ),


	isFaded: or( "faded", "fadedVodcast" ),

	fadedVodcast: and( "content.isVodcast", "settings.content.streams.filter_vodcast" ),

	fading_enabled: computed(
		"settings.content.streams.languages_fade",
		"settings.content.streams.languages_filter",
		"settings.content.hasAnyStreamsLanguagesSelection",
		"settings.content.hasSingleStreamsLanguagesSelection",
		function() {
			const settings = this.settings.content;
			const { languages_fade, languages_filter } = settings.streams;

			return languages_fade && settings.hasAnyStreamsLanguagesSelection
				&& !( languages_filter && settings.hasSingleStreamsLanguagesSelection );
		}
	),

	faded: computed(
		"fading_enabled",
		"settings.content.streams.languages",
		"content.language",
		"content.channel.broadcaster_language",
		function() {
			if ( !this.fading_enabled ) {
				return false;
			}

			const { language: clang } = this.content;

			// a channel language needs to be set
			if ( clang ) {
				const { languages } = this.settings.content.streams;
				const langs = languages.toJSON();
				const blang = get( this, "content.channel.broadcaster_language" );

				// fade out if
				// no broadcaster language is set and channel language is filtered out
				if ( !blang && !langs[ clang ] ) {
					return true;
				}
				// OR broadcaster language is set and filtered out (ignore channel language)
				if ( blang && !langs[ blang ] ) {
					return true;
				}
			}

			return false;
		}
	),


	mouseLeave() {
		const expanded = get( this, "expanded" );
		const locked = get( this, "locked" );
		if ( !expanded || locked ) { return; }

		this.clearTimer();

		this.timer = later( this, function() {
			if ( get( this, "locked" ) ) { return; }
			set( this, "expanded", false );
		}, 1000 );
	},

	clearTimer: on( "willDestroyElement", "mouseEnter", function() {
		if ( this.timer ) {
			cancel( this.timer );
			this.timer = null;
		}
	}),


	actions: {
		collapse() {
			if ( !get( this, "expanded" ) || get( this, "locked" ) ) { return; }
			this.clearTimer();
			set( this, "expanded", false );
		},

		expand() {
			if ( get( this, "expanded" ) ) {
				this.toggleProperty( "locked" );
			} else {
				set( this, "expanded", true );
			}
		}
	}
});
