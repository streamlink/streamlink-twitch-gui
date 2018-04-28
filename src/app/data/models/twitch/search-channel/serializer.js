import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchSearchChannel";
	},

	attrs: {
		channel: { deserialize: "records" }
	},

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		// fix payload format
		payload.channels = ( payload.channels || [] ).map( channel => ({ channel }) );

		return this._super( store, primaryModelClass, payload, id, requestType );
	},

	normalize( modelClass, resourceHash, prop ) {
		const foreignKey = this.store.serializerFor( "twitchChannel" ).primaryKey;

		// get the id of the embedded TwitchChannel record and apply it here
		resourceHash[ this.primaryKey ] = resourceHash.channel[ foreignKey ];

		return this._super( modelClass, resourceHash, prop );
	}
});
