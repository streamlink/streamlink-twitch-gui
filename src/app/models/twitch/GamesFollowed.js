import Game from "models/twitch/Game";


	export default Game.extend().reopenClass({
		toString: function() { return "api/users/:user/follows/games"; }
	});
