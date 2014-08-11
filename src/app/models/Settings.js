define( [ "ember", "ember-data" ], function( Ember, DS ) {

	return DS.Model.extend({
		livestreamer		: DS.attr( "string", { defaultValue: "" } ),
		quality				: DS.attr( "number", { defaultValue: 0 } ),
		player				: DS.attr( "string", { defaultValue: "" } ),
		player_params		: DS.attr( "string", { defaultValue: "" } ),
		player_passthrough	: DS.attr( "string", { defaultValue: "http" }),
		player_reconnect	: DS.attr( "boolean", { defaultValue: true } ),
		player_no_close		: DS.attr( "boolean", { defaultValue: false } ),
		gui_minimize		: DS.attr( "string", { defaultValue: "false" } ),

		qualities			: [
			{ id: 0, label: "Source", quality: "source,best" },
			{ id: 1, label: "High",   quality: "high,mobile_high" },
			{ id: 2, label: "Medium", quality: "medium,mobile_medium" },
			{ id: 3, label: "Low",    quality: "low,mobile_mobile,worst" }
		],

		passthrough			: [
			{ value: "http", label: "http" },
			{ value: "rtmp", label: "rtmp" },
			{ value: "hls",  label: "hls" }
		],

		minimize			: [
			{ value: "false", label: "Do nothing" },
			{ value: "bar",   label: "Minimize" }
		],


		isHttp: Ember.computed.equal( "player_passthrough", "http" )

	}).reopenClass({
		toString: function() { return "Settings"; }
	});

});
