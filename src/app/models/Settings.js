define( [ "ember", "ember-data" ], function( Ember, DS ) {

	var Settings = DS.Model.extend();
	Settings.toString = function() { return "Settings"; };

	var	qualities = [
			{ id: 0, label: "best",   quality: "best" },
			{ id: 1, label: "high",   quality: "high,mobile_high" },
			{ id: 2, label: "medium", quality: "medium,mobile_medium" },
			{ id: 3, label: "low",    quality: "low,mobile_mobile" },
			{ id: 4, label: "worst",  quality: "worst" }
		];

	Settings.reopen({
		livestreamer	: DS.attr( "string", { defaultValue: "" } ),
		quality			: DS.attr( "number", { defaultValue: 0 } ),
		player			: DS.attr( "string", { defaultValue: "" } ),
		player_params	: DS.attr( "string", { defaultValue: "" } ),
		player_reconnect: DS.attr( "boolean", { defaultValue: true } ),
		player_no_close	: DS.attr( "boolean", { defaultValue: true } ),

		qualities		: qualities
	});

	return Settings;

});
