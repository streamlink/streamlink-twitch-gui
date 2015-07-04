define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		modelNameFromPayloadKey: function() {
			return "twitchToken";
		},

		normalizePayload: function( payload ) {
			return {
				twitchToken: [ payload.token ]
			};
		},

		normalize: function( type, hash ) {
			hash.id = 1;
			return hash;
		}
	});

});
