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
		const follows = ( payload.follows /* istanbul ignore next */ || [] );
		delete payload.follows;
		payload[ this.modelNameFromPayloadKey() ] = follows.map( game => ({ game }) );

		return this._super( store, primaryModelClass, payload, id, requestType );
	},

	normalizeSingleResponse( store, primaryModelClass, payload, id, requestType ) {
		// fix payload format
		payload = {
			[ this.modelNameFromPayloadKey() ]: { game: payload }
		};

		return this._super( store, primaryModelClass, payload, id, requestType );
	},

	normalizeCreateRecordResponse( store, primaryModelClass, payload, id, requestType ) {
		const foreignKey = this.store.serializerFor( "twitchGame" ).primaryKey;

		// return an empty payload when creating a new record (we don't need the game relationship)
		payload = {
			[ this.modelNameFromPayloadKey() ]: {
				[ this.primaryKey ]: payload[ foreignKey ]
			}
		};

		// skip calls to normalizeSaveResponse -> normalizeSingleResponse
		return this._normalizeResponse( store, primaryModelClass, payload, id, requestType, true );
	},

	normalize( modelClass, resourceHash, prop ) {
		if ( !resourceHash[ this.primaryKey ] ) {
			const foreignKey = this.store.serializerFor( "twitchGame" ).primaryKey;

			// get the id of the embedded TwitchGame record and apply it here
			resourceHash[ this.primaryKey ] = resourceHash.game[ foreignKey ];
		}

		return this._super( modelClass, resourceHash, prop );
	}
});
