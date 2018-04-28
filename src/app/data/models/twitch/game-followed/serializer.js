import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchGameFollowed";
	},

	attrs: {
		game: { deserialize: "records" }
	},

	normalizeArrayResponse( store, primaryModelClass, payload, id, requestType ) {
		// fix payload format
		payload[ this.modelNameFromPayloadKey() ] = ( payload.follows || [] )
			.map( game => ({ game }) );
		delete payload.follows;

		return this._super( store, primaryModelClass, payload, id, requestType );
	},

	normalizeSingleResponse( store, primaryModelClass, payload, id, requestType ) {
		// fix payload format
		payload = {
			twitchGameFollowed: { game: payload }
		};

		return this._super( store, primaryModelClass, payload, id, requestType );
	},

	normalize( modelClass, resourceHash, prop ) {
		const foreignKey = this.store.serializerFor( "twitchGame" ).primaryKey;

		// get the id of the embedded TwitchGame record and apply it here
		resourceHash[ this.primaryKey ] = resourceHash.game[ foreignKey ];

		return this._super( modelClass, resourceHash, prop );
	}
});
