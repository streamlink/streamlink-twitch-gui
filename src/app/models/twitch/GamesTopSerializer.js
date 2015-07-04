define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		attrs: {
			game: { deserialize: "records" }
		},

		modelNameFromPayloadKey: function() {
			return "twitchGamesTop";
		},

		normalizeHash: {
			top: function( hash ) {
				hash.id = hash.game._id;
				return hash;
			}
		}
	});

});
