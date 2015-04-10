define( [ "ember", "ember-data" ], function( Ember, DS ) {

	return DS.Model.extend({

		advanced            : DS.attr( "boolean", { defaultValue: false } ),
		livestreamer        : DS.attr( "string", { defaultValue: "" } ),
		quality             : DS.attr( "number", { defaultValue: 0 } ),
		player              : DS.attr( "string", { defaultValue: "" } ),
		player_params       : DS.attr( "string", { defaultValue: "" } ),
		player_passthrough  : DS.attr( "string", { defaultValue: "http" } ),
		player_reconnect    : DS.attr( "boolean", { defaultValue: true } ),
		player_no_close     : DS.attr( "boolean", { defaultValue: false } ),
		gui_integration     : DS.attr( "number", { defaultValue: 3 } ),
		gui_minimizetotray  : DS.attr( "number", { defaultValue: false } ),
		gui_minimize        : DS.attr( "number", { defaultValue: 0 } ),
		gui_hidestreampopup : DS.attr( "boolean", { defaultValue: false } ),
		gui_openchat        : DS.attr( "boolean", { defaultValue: false } ),
		gui_homepage        : DS.attr( "string", { defaultValue: "/featured" } ),
		gui_layout          : DS.attr( "string", { defaultValue: "tile" } ),
		notify_enabled      : DS.attr( "boolean", { defaultValue: true } ),
		notify_grouping     : DS.attr( "boolean", { defaultValue: true } ),
		notify_click        : DS.attr( "number", { defaultValue: 1 } ),
		notify_click_group  : DS.attr( "number", { defaultValue: 1 } ),
		notify_badgelabel   : DS.attr( "boolean", { defaultValue: true } ),


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

		/**
		 * Create a new object containing the current attribute values of the record.
		 * Will be used by the settings route/controller
		 */
		readAttributes: function( record ) {
			var obj = Ember.Object.create({});
			record.eachAttribute(function( name ) {
				obj.set( name, record.get( name ) );
			});
			return obj;
		},


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
