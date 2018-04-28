import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	primaryKey: "id",

	modelNameFromPayloadKey() {
		return "twitchProduct";
	},

	attrs: {
		emoticons: { deserialize: "records" }
	}
});
