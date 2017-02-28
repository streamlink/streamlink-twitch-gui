import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchStreamFollowed";
	},

	attrs: {
		stream: { deserialize: "records" }
	},

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		// fix payload format
		payload.streams = ( payload.streams || [] ).map( stream => ({ stream }) );

		return this._super( store, primaryModelClass, payload, id, requestType );
	},

	normalize( modelClass, resourceHash, prop ) {
		const foreignKey = this.store.serializerFor( "twitchStream" ).primaryKey;

		// get the id of the embedded TwitchStream record and apply it here
		resourceHash[ this.primaryKey ] = resourceHash.stream[ foreignKey ];

		return this._super( modelClass, resourceHash, prop );
	}
});
