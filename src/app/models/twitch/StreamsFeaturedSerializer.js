define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		attrs: {
			stream: { deserialize: "records" }
		},

		modelNameFromPayloadKey: function() {
			return "twitchStreamsFeatured";
		},

		normalizeHash: {
			featured: function( hash ) {
				hash.id = hash.stream._id;
				return hash;
			}
		}
	});

});
