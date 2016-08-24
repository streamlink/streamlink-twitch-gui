import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	primaryKey: "regex",

	modelNameFromPayloadKey: function() {
		return "twitchProductEmoticon";
	}
});
