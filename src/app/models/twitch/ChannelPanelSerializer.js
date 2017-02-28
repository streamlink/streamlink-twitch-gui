import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchChannelPanel";
	},

	attrs: {
		panels: { deserialize: "records" }
	},

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		// fix payload format
		payload = {
			twitchChannelPanel: {
				[ this.primaryKey ]: id,
				panels: payload
			}
		};

		return this._super( store, primaryModelClass, payload, id, requestType );
	}
});
