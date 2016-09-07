import GamesTopSerializer from "models/twitch/GamesTopSerializer";


export default GamesTopSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchGamesLiveFollowed";
	}
});
