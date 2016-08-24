import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchStreamsFollowed";
	},

	attrs: {
		stream: { deserialize: "records" }
	},

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		payload.streams = ( payload.streams || [] ).map(function( hash ) {
			return {
				stream: hash
			};
		});

		return this._super( store, primaryModelClass, payload, id, requestType );
	},

	normalize( modelClass, resourceHash, prop ) {
		var foreignKey = this.store.serializerFor( "twitchChannel" ).primaryKey;
		resourceHash[ this.primaryKey ] = resourceHash.stream.channel[ foreignKey ];

		return this._super( modelClass, resourceHash, prop );
	}
});
