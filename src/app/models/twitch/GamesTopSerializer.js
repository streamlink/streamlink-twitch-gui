define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		modelNameFromPayloadKey: function() {
			return "twitchGamesTop";
		},

		attrs: {
			game: { deserialize: "records" }
		},

		normalizeHash: {
			top: function( hash ) {
				hash.id = hash.game._id;
				return hash;
			}
		}
	});

});
