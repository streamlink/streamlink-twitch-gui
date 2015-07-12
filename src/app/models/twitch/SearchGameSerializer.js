define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		modelNameFromPayloadKey: function() {
			return "twitchSearchGame";
		},

		attrs: {
			game: { deserialize: "records" }
		},

		normalizePayload: function( payload ) {
			return {
				games: ( payload.games || [] ).map(function( hash ) {
					return { game: hash };
				})
			};
		},

		normalizeHash: {
			games: function( hash ) {
				hash.id = hash.game._id;
				return hash;
			}
		}
	});

});
