define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		attrs: {
			channel: { deserialize: "records" }
		},

		normalizeHash: {
			follows: function( hash ) {
				hash.id = hash.channel.name;
				return hash;
			}
		},

		modelNameFromPayloadKey: function() {
			return "twitchChannelsFollowed";
		}
	});

});
