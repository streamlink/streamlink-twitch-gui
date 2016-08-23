import Game from "models/twitch/Game";


export default Game.extend().reopenClass({
	toString() { return "api/users/:user/follows/games"; }
});
