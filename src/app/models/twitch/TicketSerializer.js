import TwitchSerializer from "store/TwitchSerializer";


	export default TwitchSerializer.extend({
		primaryKey: "id",

		modelNameFromPayloadKey: function() {
			return "twitchTicket";
		},

		attrs: {
			product: { deserialize: "records" }
		}
	});
