import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	primaryKey: "id",

	modelNameFromPayloadKey() {
		return "twitchTicket";
	},

	attrs: {
		product: { deserialize: "records" }
	}
});
