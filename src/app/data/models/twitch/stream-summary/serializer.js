import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchStreamSummary";
	},

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		// always use 1 as id
		payload[ this.primaryKey ] = 1;

		// fix payload format
		payload = {
			twitchStreamSummary: payload
		};

		return this._super( store, primaryModelClass, payload, id, requestType );
	}
});
