import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	primaryKey: "broadcaster_id",

	modelNameFromPayloadKey() {
		return "twitch-channel";
	}
});
