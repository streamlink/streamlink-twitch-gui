define([
	"Ember",
	"components/ListItemComponent",
	"hbs!templates/components/stream.html"
], function(
	Ember,
	ListItemComponent,
	layout
) {

	var get = Ember.get;
	var alias = Ember.computed.alias;
	var and = Ember.computed.and;
	var bool = Ember.computed.bool;

	return ListItemComponent.extend({
		layout: layout,
		classNameBindings: [
			":stream-component",
			"_showGame:show-game",
			"showFlag:show-flag",
			"faded:faded"
		],

		action: "openLivestreamer",

		channel: alias( "content.channel" ),

		showGame: false,
		_showGame: and( "showGame", "channel.game" ),

		showFlag: bool( "settings.gui_flagsvisible" ),

		faded: function() {
			if ( get( this, "settings.gui_filterstreams" ) ) {
				return false;
			}

			var filter = get( this, "settings.gui_langfilter" );
			var clang  = get( this, "channel.language" );
			var blang  = get( this, "channel.broadcaster_language" );

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
		}.property(
			"settings.gui_langfilter",
			"content.channel.language",
			"content.channel.broadcaster_language"
		),

		/**
		 * @returns {boolean} return false if none or all languages are selected
		 */
		hasCustomLangFilter: function() {
			var filters = get( this, "settings.gui_langfilter" );
			var keys    = Object.keys( filters );
			var current = filters[ keys.shift() ];
			return keys.reduce(function( result, value ) {
				if ( !result ) {
					value   = filters[ value ];
					result  = current !== value;
					current = value;
				}
				return result;
			}, false );
		}.property( "settings.gui_langfilter" ),

		actions: {
			"startStream": function() {
				this.sendAction( "action", get( this, "content" ) );
			}
		}
	});

});
