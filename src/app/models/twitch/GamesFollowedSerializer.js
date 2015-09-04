define( [ "models/twitch/GameSerializer" ], function( GameSerializer ) {

	return GameSerializer.extend({
		modelNameFromPayloadKey: function() {
			return "twitchGamesFollowed";
		}
	});

});
