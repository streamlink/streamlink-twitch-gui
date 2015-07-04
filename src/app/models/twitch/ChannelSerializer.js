define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		primaryKey: "name",

		modelNameFromPayloadKey: function() {
			return "twitchChannel";
		},

		attrs : {
			teams: { deserialize: "records" }
		},

		normalizePayload: function( payload ) {
			return {
				twitchChannel: payload
			};
		}
	});

});
