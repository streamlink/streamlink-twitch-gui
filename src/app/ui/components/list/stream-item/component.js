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

	/** @type {TwitchChannel} */
	channel: alias( "content.channel" ),

	expanded: false,
	locked  : false,
	timer   : null,

	showGame: notEmpty( "channel.game" ),

	infoGame: equal( "settings.content.streams.info", ATTR_STREAMS_INFO_GAME ),
	infoTitle: equal( "settings.content.streams.info", ATTR_STREAMS_INFO_TITLE ),


	isFaded: or( "faded", "fadedVodcast" ),

	fadedVodcast: and( "content.isVodcast", "settings.content.streams.filter_vodcast" ),

	faded: computed(
		"settings.content.streams.filter_languages",
		"settings.content.streams.language",
		"channel.language",
		"channel.broadcaster_language",
		function() {
			const { filter_languages, language } = this.settings.content.streams;

			if ( filter_languages !== false ) {
				return false;
			}

			const { language: clang, broadcaster_language: blang } = this.channel;

			// a channel language needs to be set
			if ( clang ) {
				// fade out if
				// no broadcaster language is set and channel language is filtered out
				if ( !blang && clang !== language ) {
					return true;
				}
				// OR broadcaster language is set and filtered out (ignore channel language)
				if ( blang && blang !== language ) {
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
