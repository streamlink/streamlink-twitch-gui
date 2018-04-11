import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchSubscription";
	},

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		const foreignKey = this.store.serializerFor( "twitchChannel" ).primaryKey;

		// get the id of the embedded TwitchChannel record and apply it here
		payload[ this.primaryKey ] = payload.channel[ foreignKey ];

		// fix payload format
		payload = {
			twitchSubscription: payload
		};

		return this._super( store, primaryModelClass, payload, id, requestType );
	}
});
