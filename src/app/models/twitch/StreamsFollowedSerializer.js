define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		attrs: {
			stream: { deserialize: "records" }
		},

		typeForRoot: function() {
			return "twitchStreamsFollowed";
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
