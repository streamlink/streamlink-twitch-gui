define( [ "Ember", "EmberData" ], function( Ember, DS ) {

	var get = Ember.get;
	var set = Ember.set;
	var attr = DS.attr;
	var isWin = process.platform === "win32";

	function defaultLangFilterValue( model ) {
		var codes = get( model, "metadata.config.language_codes" );
		return Object.keys( codes ).reduce(function( obj, key ) {
			obj[ key ] = true;
			return obj;
		}, {} );
	}

	return DS.Model.extend({
		metadata: Ember.inject.service(),

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
		gui_integration     : attr( "number",  { defaultValue: 3 } ),
		gui_minimizetotray  : attr( "number",  { defaultValue: false } ),
		gui_minimize        : attr( "number",  { defaultValue: 0 } ),
		gui_hidestreampopup : attr( "boolean", { defaultValue: false } ),
		gui_openchat        : attr( "boolean", { defaultValue: false } ),
		gui_homepage        : attr( "string",  { defaultValue: "/featured" } ),
		gui_layout          : attr( "string",  { defaultValue: "tile" } ),
		gui_flagsvisible    : attr( "boolean", { defaultValue: false } ),
		gui_filterstreams   : attr( "boolean", { defaultValue: false } ),
		gui_langfilter      : attr( "",        { defaultValue: defaultLangFilterValue } ),
		notify_enabled      : attr( "boolean", { defaultValue: true } ),
		notify_all          : attr( "boolean", { defaultValue: true } ),
		notify_grouping     : attr( "boolean", { defaultValue: true } ),
		notify_click        : attr( "number",  { defaultValue: 1 } ),
		notify_click_group  : attr( "number",  { defaultValue: 1 } ),
		notify_badgelabel   : attr( "boolean", { defaultValue: true } ),
		hls_live_edge       : attr( "number",  { defaultValue: 3, minValue: 1, maxValue: 10 } ),
		hls_segment_threads : attr( "number",  { defaultValue: 1, minValue: 1, maxValue: 10 } ),
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
		}.property( "gui_integration" )

	}).reopenClass({

		toString: function() { return "Settings"; },

		qualities: [
			{ id: 0, label: "Source", quality: "source,best" },
			{ id: 1, label: "High",   quality: "high,mobile_high,best" },
			{ id: 2, label: "Medium", quality: "medium,mobile_medium,worst" },
			{ id: 3, label: "Low",    quality: "low,mobile_mobile,worst" }
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
			{ id: "custom",   label: "Custom application" }
		],

		gui_filterstreams: [
			{ value: false, label: "Fade out streams" },
			{ value: true,  label: "Filter out streams" }
		]

	});

});
