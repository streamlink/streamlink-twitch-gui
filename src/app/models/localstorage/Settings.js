import Ember from "Ember";
import DS from "EmberData";
import config from "config";
import platform from "utils/node/platform";


	var get = Ember.get;
	var set = Ember.set;
	var attr = DS.attr;

	var langs = config.langs;
	var langCodes = Object.keys( langs );

	var isWin = platform.isWin;


	function defaultLangFilterValue() {
		return langCodes.reduce(function( obj, code ) {
			if ( !langs[ code ].disabled ) {
				obj[ code ] = true;
			}
			return obj;
		}, {} );
	}


	export default DS.Model.extend({
		advanced            : attr( "boolean", { defaultValue: false } ),
		livestreamer        : attr( "string",  { defaultValue: "" } ),
		livestreamer_params : attr( "string",  { defaultValue: "" } ),
		quality             : attr( "number",  { defaultValue: 0 } ),
		player              : attr( "string",  { defaultValue: "" } ),
		player_params       : attr( "string",  { defaultValue: "" } ),
		player_passthrough  : attr( "string",  { defaultValue: "http" } ),
		player_reconnect    : attr( "boolean", { defaultValue: true } ),
		player_no_close     : attr( "boolean", { defaultValue: false } ),
		gui_theme           : attr( "string",  { defaultValue: "default" } ),
		gui_smoothscroll    : attr( "boolean", { defaultValue: true } ),
		gui_integration     : attr( "number",  { defaultValue: 3 } ),
		gui_minimizetotray  : attr( "number",  { defaultValue: false } ),
		gui_minimize        : attr( "number",  { defaultValue: 0 } ),
		gui_focusrefresh    : attr( "number",  { defaultValue: 0 } ),
		gui_hidestreampopup : attr( "boolean", { defaultValue: false } ),
		gui_openchat        : attr( "boolean", { defaultValue: false } ),
		gui_openchat_context: attr( "boolean", { defaultValue: false } ),
		gui_twitchemotes    : attr( "boolean", { defaultValue: false } ),
		gui_homepage        : attr( "string",  { defaultValue: "/featured" } ),
		gui_layout          : attr( "string",  { defaultValue: "tile" } ),
		gui_filterstreams   : attr( "boolean", { defaultValue: false } ),
		gui_langfilter      : attr( "",        { defaultValue: defaultLangFilterValue } ),
		stream_info         : attr( "number",  { defaultValue: 0 } ),
		stream_show_flag    : attr( "boolean", { defaultValue: false } ),
		stream_show_info    : attr( "boolean", { defaultValue: false } ),
		stream_click_middle : attr( "number",  { defaultValue: 2 } ),
		stream_click_modify : attr( "number",  { defaultValue: 4 } ),
		notify_enabled      : attr( "boolean", { defaultValue: true } ),
		notify_all          : attr( "boolean", { defaultValue: true } ),
		notify_grouping     : attr( "boolean", { defaultValue: true } ),
		notify_click        : attr( "number",  { defaultValue: 1 } ),
		notify_click_group  : attr( "number",  { defaultValue: 1 } ),
		notify_badgelabel   : attr( "boolean", { defaultValue: true } ),
		notify_shortcut     : attr( "boolean", { defaultValue: true } ),
		hls_live_edge       : attr( "string",  { defaultValue: "3", min: "1", max: "10" } ),
		hls_segment_threads : attr( "string",  { defaultValue: "1", min: "1", max: "10" } ),
		retry_open          : attr( "string",  { defaultValue: "1", min: "1", max: "10" } ),
		retry_streams       : attr( "string",  { defaultValue: "1", min: "0", max: "3" } ),
		chat_method         : attr( "string",  { defaultValue: "default" } ),
		chat_command        : attr( "string",  { defaultValue: "" } ),


		// correct old value
		gui_minimize_observer: function() {
			if ( isNaN( get( this, "gui_minimize" ) ) ) {
				set( this, "gui_minimize", 0 );
			}
		}.observes( "gui_minimize" ),

		isVisibleInTaskbar: function() {
			return ( get( this, "gui_integration" ) & 1 ) > 0;
		}.property( "gui_integration" ),

		isVisibleInTray: function() {
			return ( get( this, "gui_integration" ) & 2 ) > 0;
		}.property( "gui_integration" ),

		playerParamsCorrected: function() {
			var params = get( this, "player_params" );
			return params.length && params.indexOf( "{filename}" ) === -1
				? params + " {filename}"
				: params;
		}.property( "player_params" )

	}).reopenClass({

		toString: function() { return "Settings"; },

		/**
		 * Use a static list of qualities on twitch recognized by livestreamer:
		 * source, high, medium, low, mobile
		 *
		 * Specific qualities are available for a couple of special channels:
		 * 144p30, 240p30, 360p30, 480p30, 540p30, 720p30, 720p60
		 * https://blog.twitch.tv/-705404e95cc2
		 *
		 * Always add an ultimate fallback quality to the end of the list. This is needed for
		 * watching unpartnered channels that are only available in source quality when a
		 * different default quality has been selected by the user.
		 */
		qualities: [
			// Source - input stream from the broadcaster
			{ id: 0, label: "Source",     quality: "source,1080p60,best" },
			// High   - 720p30 @ ~1.25 Mbit/s (use the same framerate first)
			{ id: 1, label: "High",       quality: "high,720p30,720p60,best" },
			// Medium - 480p30 @ ~0.75 Mbit/s (use the same bitrate first)
			{ id: 2, label: "Medium",     quality: "medium,480p30,540p30,worst" },
			// Low    - 360p30 @ ~0.50 Mbit/s (use the same resolution first)
			{ id: 3, label: "Low",        quality: "low,360p30,240p30,144p30,mobile,worst" },
			// Audio (no fallback qualities)
			{ id: 4, label: "Audio only", quality: "audio" }
		],

		passthrough: [
			{ value: "http", label: "http" },
			{ value: "rtmp", label: "rtmp" },
			{ value: "hls",  label: "hls" }
		],

		// bitwise IDs: both & 1 && both & 2
		integration: [
			{ id: 3, label: "Both" },
			{ id: 1, label: "Taskbar" },
			{ id: 2, label: "Tray" }
		],

		minimize: [
			{ id: 0, label: "Do nothing" },
			{ id: 1, label: "Minimize" },
			{ id: 2, label: "Move to tray" }
		],

		gui_focusrefresh: [
			{ value:      0, label: "Don't refresh" },
			{ value:  60000, label: "After one minute" },
			{ value: 120000, label: "After two minutes" },
			{ value: 300000, label: "After five minutes" }
		],

		notify_all: [
			{ value: true,  label: "Show all except disabled ones" },
			{ value: false, label: "Ignore all except enabled ones" }
		],

		notify_click: [
			{ id: 0, label: "Do nothing" },
			{ id: 1, label: "Go to favorites" },
			{ id: 2, label: "Open stream" },
			{ id: 3, label: "Open stream+chat" }
		],

		notify_click_group: [
			{ id: 1, label: "Go to favorites" },
			{ id: 2, label: "Open all streams" },
			{ id: 3, label: "Open all streams+chats" }
		],

		chat_methods: [
			// TODO: change to "browser"
			{ id: "default",  label: "Default Browser" },
			// TODO: change to "default"
			{ id: "irc",      label: "Internal IRC Client", disabled: true },
			{ id: "chromium", label: "Chromium" },
			{ id: "chrome",   label: "Google Chrome" },
			{ id: "msie",     label: "Internet Explorer", disabled: !isWin },
			{ id: "chatty",   label: "Chatty" },
			{ id: "custom",   label: "Custom application" }
		],

		gui_filterstreams: [
			{ value: false, label: "Fade out streams" },
			{ value: true,  label: "Filter out streams" }
		],

		stream_info: [
			{ id: 0, label: "Game being played" },
			{ id: 1, label: "Stream title" }
		],

		stream_click: [
			{ id: 0, key: "disabled", label: "Do nothing" },
			{ id: 1, key: "launch",   label: "Launch stream" },
			{ id: 2, key: "chat",     label: "Open chat" },
			{ id: 3, key: "channel",  label: "Go to channel page" },
			{ id: 4, key: "settings", label: "Go to channel settings" }
		]

	});
