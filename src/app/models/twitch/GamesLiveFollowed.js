import GamesTop from "models/twitch/GamesTop";


export default GamesTop.extend().reopenClass({
	toString: function() { return "api/users/:user/follows/games/live"; }
});
