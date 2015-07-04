define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		modelNameFromPayloadKey: function() {
			return "twitchStreamsFollowed";
		},

		attrs: {
			stream: { deserialize: "records" }
		},

		normalizePayload: function( payload ) {
			return {
				streams: ( payload.streams || [] ).map(function( hash ) {
					return { stream: hash };
				})
			};
		},

		normalizeHash: {
			streams: function( hash ) {
				hash.id = hash.stream.channel.name;
				return hash;
			}
		}
	});

});
