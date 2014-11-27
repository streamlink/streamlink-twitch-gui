define( [ "ember", "ember-data" ], function( Ember, DS ) {

	return DS.Model.extend({

		livestreamer		: DS.attr( "string", { defaultValue: "" } ),
		quality				: DS.attr( "number", { defaultValue: 0 } ),
		player				: DS.attr( "string", { defaultValue: "" } ),
		player_params		: DS.attr( "string", { defaultValue: "" } ),
		player_passthrough	: DS.attr( "string", { defaultValue: "http" } ),
		player_reconnect	: DS.attr( "boolean", { defaultValue: true } ),
		player_no_close		: DS.attr( "boolean", { defaultValue: false } ),
		gui_minimize		: DS.attr( "string", { defaultValue: "false" } ),
		gui_hidestreampopup	: DS.attr( "boolean", { defaultValue: false } ),
		gui_openchat		: DS.attr( "boolean", { defaultValue: false } ),
		gui_homepage		: DS.attr( "string", { defaultValue: "/featured" } ),
		gui_layout			: DS.attr( "string", { defaultValue: "tile" } )

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

		minimize: (function() {
			var	minimize = [
					{ value: "false", label: "Do nothing" },
					{ value: "bar",   label: "Minimize" }
				];

			// move to tray only on windows
			// tray icon doesn't work on osx+linux
			if ( /^win/.test( process.platform ) ) {
				minimize.push({ value: "tray", label: "Move to tray" });
			}

			return minimize;
		})()

	});

});
