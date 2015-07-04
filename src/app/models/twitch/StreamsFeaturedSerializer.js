define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		modelNameFromPayloadKey: function() {
			return "twitchStreamsFeatured";
		},

		attrs: {
			stream: { deserialize: "records" }
		},

		normalizeHash: {
			featured: function( hash ) {
				hash.id = hash.stream._id;
				return hash;
			}
		}
	});

});
