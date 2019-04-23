import TwitchSerializer from "data/models/twitch/serializer";


export default class TwitchSubscriptionSerializer extends TwitchSerializer {
	modelNameFromPayloadKey = () => "twitch-subscription";

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		const foreignKey = this.store.serializerFor( "twitch-channel" ).primaryKey;

		// get the id of the embedded TwitchChannel record and apply it here
		payload[ this.primaryKey ] = payload.channel[ foreignKey ];

		// fix payload format
		payload = {
			[ this.modelNameFromPayloadKey() ]: payload
		};

		return super.normalizeResponse( store, primaryModelClass, payload, id, requestType );
	}
}
