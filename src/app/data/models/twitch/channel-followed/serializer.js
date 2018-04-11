import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchChannelFollowed";
	},

	attrs: {
		channel: { deserialize: "records" }
	},

	normalizeSingleResponse( store, primaryModelClass, payload, id, requestType ) {
		// fix payload format
		payload = {
			twitchChannelFollowed: payload
		};

		return this._super( store, primaryModelClass, payload, id, requestType );
	},

	normalize( modelClass, resourceHash, prop ) {
		const foreignKey = this.store.serializerFor( "twitchChannel" ).primaryKey;

		// get the id of the embedded TwitchChannel record and apply it here
		resourceHash[ this.primaryKey ] = resourceHash.channel[ foreignKey ];

		return this._super( modelClass, resourceHash, prop );
	}
});
