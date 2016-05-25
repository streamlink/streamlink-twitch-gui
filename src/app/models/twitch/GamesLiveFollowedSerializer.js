define([
	"models/twitch/GamesTopSerializer"
], function(
	GamesTopSerializer
) {

	return GamesTopSerializer.extend({
		modelNameFromPayloadKey: function() {
			return "twitchGamesLiveFollowed";
		}
	});

});
