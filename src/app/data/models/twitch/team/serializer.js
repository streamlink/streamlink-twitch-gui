import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	primaryKey: "name",

	modelNameFromPayloadKey() {
		return "twitchTeam";
	},

	attrs: {
		users: { deserialize: "records" }
	},

	normalizeSingleResponse( store, primaryModelClass, payload, id, requestType ) {
		// fix payload format
		payload = {
			[ this.modelNameFromPayloadKey() ]: payload
		};

		return this._super( store, primaryModelClass, payload, id, requestType );
	}
});
