define([
	"models/twitch/Game"
], function(
	Game
) {

	return Game.extend().reopenClass({
		toString: function() { return "api/users/:user/follows/games"; }
	});

});
