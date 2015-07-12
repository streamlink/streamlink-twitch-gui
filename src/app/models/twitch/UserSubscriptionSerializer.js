define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		modelNameFromPayloadKey: function() {
			return "twitchUserSubscription";
		},

		normalizePayload: function( payload ) {
			payload._id = payload.channel.name;
			payload.channel = null;
			return {
				twitchUserSubscription: payload
			};
		}
	});

});
