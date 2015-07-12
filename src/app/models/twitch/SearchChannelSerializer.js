define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		modelNameFromPayloadKey: function() {
			return "twitchSearchChannel";
		},

		attrs: {
			channel: { deserialize: "records" }
		},

		normalizePayload: function( payload ) {
			return {
				channels: ( payload.channels || [] ).map(function( hash ) {
					return { channel: hash };
				})
			};
		},

		normalizeHash: {
			channels: function( hash ) {
				hash.id = hash.channel.name;
				return hash;
			}
		}
	});

});
