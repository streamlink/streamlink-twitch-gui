import TwitchSerializer from "data/models/twitch/serializer";


export default class TwitchTeamSerializer extends TwitchSerializer {
	primaryKey = "name";

	modelNameFromPayloadKey = () => "twitch-team";

	attrs = {
		users: { deserialize: "records" }
	};

	normalizeSingleResponse( store, primaryModelClass, payload, id, requestType ) {
		// fix payload format
		payload = {
			[ this.modelNameFromPayloadKey() ]: payload
		};

		return super.normalizeSingleResponse( store, primaryModelClass, payload, id, requestType );
	}
}
