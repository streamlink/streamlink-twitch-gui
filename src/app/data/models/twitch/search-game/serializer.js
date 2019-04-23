import TwitchSerializer from "data/models/twitch/serializer";


export default class TwitchSearchGameSerializer extends TwitchSerializer {
	modelNameFromPayloadKey = () => "twitch-search-game";

	attrs = {
		game: { deserialize: "records" }
	};

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		// fix payload format
		payload.games = ( payload.games || [] ).map( game => ({ game }) );

		return super.normalizeResponse( store, primaryModelClass, payload, id, requestType );
	}

	normalize( modelClass, resourceHash, prop ) {
		const foreignKey = this.store.serializerFor( "twitch-game" ).primaryKey;

		// get the id of the embedded TwitchGame record and apply it here
		resourceHash[ this.primaryKey ] = resourceHash.game[ foreignKey ];

		return super.normalize( modelClass, resourceHash, prop );
	}
}
