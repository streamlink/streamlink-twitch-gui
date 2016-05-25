define([
	"models/twitch/GamesTop"
], function(
	GamesTop
) {

	return GamesTop.extend().reopenClass({
		toString: function() { return "api/users/:user/follows/games/live"; }
	});

});
