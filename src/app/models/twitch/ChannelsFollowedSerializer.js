define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		modelNameFromPayloadKey: function() {
			return "twitchChannelsFollowed";
		},

		attrs: {
			channel: { deserialize: "records" }
		},

		normalizeHash: {
			follows: function( hash ) {
				hash.id = hash.channel.name;
				return hash;
			}
		}
	});

});
