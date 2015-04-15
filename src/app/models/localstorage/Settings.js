define( [ "ember-data" ], function( DS ) {

	var attr = DS.attr;

	return DS.Model.extend({

		advanced            : attr( "boolean", { defaultValue: false } ),
		livestreamer        : attr( "string",  { defaultValue: "" } ),
		quality             : attr( "number",  { defaultValue: 0 } ),
		player              : attr( "string",  { defaultValue: "" } ),
		player_params       : attr( "string",  { defaultValue: "" } ),
		player_passthrough  : attr( "string",  { defaultValue: "http" } ),
		player_reconnect    : attr( "boolean", { defaultValue: true } ),
		player_no_close     : attr( "boolean", { defaultValue: false } ),
		gui_integration     : attr( "number",  { defaultValue: 3 } ),
		gui_minimizetotray  : attr( "number",  { defaultValue: false } ),
		gui_minimize        : attr( "number",  { defaultValue: 0 } ),
		gui_hidestreampopup : attr( "boolean", { defaultValue: false } ),
		gui_openchat        : attr( "boolean", { defaultValue: false } ),
		gui_homepage        : attr( "string",  { defaultValue: "/featured" } ),
		gui_layout          : attr( "string",  { defaultValue: "tile" } ),
		notify_enabled      : attr( "boolean", { defaultValue: true } ),
		notify_grouping     : attr( "boolean", { defaultValue: true } ),
		notify_click        : attr( "number",  { defaultValue: 1 } ),
		notify_click_group  : attr( "number",  { defaultValue: 1 } ),
		notify_badgelabel   : attr( "boolean", { defaultValue: true } ),


		// correct old value
		gui_minimize_observer: function() {
			if ( isNaN( this.get( "gui_minimize" ) ) ) {
				this.set( "gui_minimize", 0 );
			}
		}.observes( "gui_minimize" ),

		isVisibleInTaskbar: function() {
			return ( this.get( "gui_integration" ) & 1 ) > 0;
		}.property( "gui_integration" ),

		isVisibleInTray: function() {
			return ( this.get( "gui_integration" ) & 2 ) > 0;
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
		]

	});

});
