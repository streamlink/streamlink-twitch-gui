import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	primaryKey: "name",

	modelNameFromPayloadKey() {
		return "twitchProduct";
	},

	attrs: {
		emoticons: { deserialize: "records" }
	}
});
