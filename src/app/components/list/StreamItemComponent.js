import {
	get,
	set,
	computed,
	run,
	on
} from "ember";
import ListItemComponent from "./ListItemComponent";
import {
	ATTR_STREAMS_INFO_GAME,
	ATTR_STREAMS_INFO_TITLE
} from "models/localstorage/Settings/streams";
import layout from "templates/components/list/StreamItemComponent.hbs";


const { alias, equal, notEmpty, or } = computed;
const { cancel, later } = run;


export default ListItemComponent.extend({
	layout,

	classNameBindings: [
		":stream-item-component",
		"showGame:show-game",
		"host:show-host",
		"settings.streams.show_flag:show-flag",
		"settings.streams.show_info:show-info",
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

	infoGame: equal( "settings.streams.info", ATTR_STREAMS_INFO_GAME ),
	infoTitle: equal( "settings.streams.info", ATTR_STREAMS_INFO_TITLE ),


	_faded: or( "faded", "fadeVodcast" ),


	faded: computed(
		"settings.streams.filter_languages",
		"settings.streams.languages",
		"content.channel.language",
		"content.channel.broadcaster_language",
		"hasCustomLangFilter",
		function() {
			if ( get( this, "settings.streams.filter_languages" ) ) {
				return false;
			}

			const languages = get( this, "settings.streams.languages" ).toJSON();
			const clang = get( this, "channel.language" );
			const blang = get( this, "channel.broadcaster_language" );

			// a channel language needs to be set
			if ( clang ) {
				// fade out if
				// no broadcaster language is set and channel language is filtered out
				if ( !blang && languages[ clang ] === false ) {
					return true;
				}
				// OR broadcaster language is set and filtered out (ignore channel language)
				if ( blang && languages[ blang ] === false ) {
					return true;
				}
				// OR broadcaster language is set to "other" and a filter has been set
				if ( blang === "other" && get( this, "hasCustomLangFilter" ) ) {
					return true;
				}
			}

			return false;
		}
	),

	/**
	 * @returns {boolean} return false if none or all languages are selected
	 */
	hasCustomLangFilter: computed( "settings.streams.languages", function() {
		const languages = get( this, "settings.streams.languages" ).toJSON();

		const keys = Object.entries( languages );
		if ( !keys.length ) {
			return false;
		}

		let [ , previous ] = keys.shift();
		for ( const [ , key ] of keys ) {
			if ( previous !== key ) {
				return true;
			}
			previous = key;
		}

		return false;
	}),


	fadeVodcast: computed( "content.isVodcast", "settings.streams.filter_vodcast", function() {
		return get( this, "settings.streams.filter_vodcast" )
		    && get( this, "content.isVodcast" );
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
