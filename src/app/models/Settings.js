define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		livestreamer	: DS.attr( "string", { defaultValue: "" } ),
		quality			: DS.attr( "number", { defaultValue: 0 } ),
		player			: DS.attr( "string", { defaultValue: "" } ),
		player_params	: DS.attr( "string", { defaultValue: "" } ),
		player_reconnect: DS.attr( "boolean", { defaultValue: true } ),
		player_no_close	: DS.attr( "boolean", { defaultValue: true } ),
		gui_minimize	: DS.attr( "boolean", { defaultValue: false } ),

		qualities		: [
			{ id: 0, label: "source", quality: "source,best" },
			{ id: 1, label: "high",   quality: "high,mobile_high" },
			{ id: 2, label: "medium", quality: "medium,mobile_medium" },
			{ id: 3, label: "low",    quality: "low,mobile_mobile,worst" }
		]
	}).reopenClass({
		toString: function() { return "Settings"; }
	});

});
