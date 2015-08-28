define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		primaryKey: "name",

		modelNameFromPayloadKey: function() {
			return "twitchUserFollowsGame";
		},

		normalizePayload: function( payload ) {
			if ( !payload || !payload.name ) { return {}; }

			// return an empty payload (ignore all properties)
			return {
				twitchUserFollowsGame: [{
					name: payload.name
				}]
			};
		}
	});

});
