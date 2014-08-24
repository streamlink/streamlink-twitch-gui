define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		primaryKey: "id",

		normalizePayload: function( payload ) {
			return {
				twitchStreamsSummaries: [{
					id: 1,
					channels: payload.channels,
					viewers: payload.viewers
				}]
			};
		}
	});

});
