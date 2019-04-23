import TwitchSerializer from "data/models/twitch/serializer";


export default class TwitchStreamSummarySerializer extends TwitchSerializer {
	modelNameFromPayloadKey = () => "twitch-stream-summary";

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		// always use 1 as id
		payload[ this.primaryKey ] = 1;

		// fix payload format
		payload = {
			[ this.modelNameFromPayloadKey() ]: payload
		};

		return super.normalizeResponse( store, primaryModelClass, payload, id, requestType );
	}
}
