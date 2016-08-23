import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	primaryKey: "regex",

	modelNameFromPayloadKey() {
		return "twitchProductEmoticon";
	}
});
