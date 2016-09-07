import GamesTop from "models/twitch/GamesTop";


export default GamesTop.extend().reopenClass({
	toString() { return "api/users/:user/follows/games/live"; }
});
