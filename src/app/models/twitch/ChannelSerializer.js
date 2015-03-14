define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		primaryKey: "name",

		attrs : {
			teams: { deserialize: "records" }
		},

		normalizePayload: function( payload ) {
			return {
				twitchChannel: payload
			};
		},

		typeForRoot: function() {
			return "twitchChannel";
		}
	});

});
