import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	primaryKey: "id",

	modelNameFromPayloadKey() {
		return "twitchProduct";
	},

	attrs: {
		emoticons: { deserialize: "records" }
	}
});
