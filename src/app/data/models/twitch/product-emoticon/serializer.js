import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	primaryKey: "regex",

	modelNameFromPayloadKey() {
		return "twitchProductEmoticon";
	}
});
