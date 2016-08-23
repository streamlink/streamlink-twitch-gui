import GameSerializer from "models/twitch/GameSerializer";


export default GameSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchGamesFollowed";
	}
});
