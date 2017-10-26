import {
	get,
	set,
	computed,
	run,
	on
} from "ember";
import ListItemComponent from "components/list/ListItemComponent";
import layout from "templates/components/list/StreamItemComponent.hbs";


const { alias, equal, notEmpty, or } = computed;
const { cancel, later } = run;


export default ListItemComponent.extend({
	layout,

	classNameBindings: [
		":stream-item-component",
		"showGame:show-game",
		"host:show-host",
		"settings.stream_show_flag:show-flag",
		"settings.stream_show_info:show-info",
		"infoGame:info-game",
		"infoTitle:info-title",
		"_faded:faded",
		"expanded:expanded"
	],

	channel: alias( "content.channel" ),

	expanded: false,
	locked  : false,
	timer   : null,

	showGame: notEmpty( "channel.game" ),

	infoGame : equal( "settings.stream_info", 0 ),
	infoTitle: equal( "settings.stream_info", 1 ),


	_faded: or( "faded", "fadeVodcast" ),


	faded: computed(
		"settings.gui_langfilter",
		"content.channel.language",
		"content.channel.broadcaster_language",
		function() {
			if ( get( this, "settings.gui_filterstreams" ) ) {
				return false;
			}

			let filter = get( this, "settings.gui_langfilter" );
			let clang  = get( this, "channel.language" );
			let blang  = get( this, "channel.broadcaster_language" );

			// a channel language needs to be set
			return clang
				&& (
					// fade out if
					// no broadcaster language is set and channel language is filtered out
					   !blang && filter[ clang ] === false
					// OR broadcaster language is set and filtered out (ignore channel language)
					||  blang && filter[ blang ] === false
					// OR broadcaster language is set to "other" and a filter has been set
					||  blang === "other" && get( this, "hasCustomLangFilter" )
				);
		}
	),

	/**
	 * @returns {boolean} return false if none or all languages are selected
	 */
	hasCustomLangFilter: computed( "settings.gui_langfilter", function() {
		const filters = get( this, "settings.gui_langfilter" );
		const keys = Object.keys( filters );
		let current = filters[ keys.shift() ];

		return keys.reduce(function( result, value ) {
			if ( !result ) {
				value   = filters[ value ];
				result  = current !== value;
				current = value;
			}
			return result;
		}, false );
	}),


	fadeVodcast: computed( "content.isVodcast", "settings.gui_vodcastfilter", function() {
		return get( this, "content.isVodcast" )
			&& get( this, "settings.gui_vodcastfilter" );
	}),


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
