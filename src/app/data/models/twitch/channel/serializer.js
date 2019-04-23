import TwitchSerializer from "data/models/twitch/serializer";


export default class TwitchChannelSerializer extends TwitchSerializer {
	modelNameFromPayloadKey = () => "twitch-channel";

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		payload = {
			[ this.modelNameFromPayloadKey() ]: payload
		};

		return super.normalizeResponse( store, primaryModelClass, payload, id, requestType );
	}
}
