define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		attrs: {
			game: { deserialize: "records" }
		},

		modelNameFromPayloadKey: function() {
			return "twitchSearchGame";
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
