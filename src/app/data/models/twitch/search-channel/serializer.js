import TwitchSerializer from "data/models/twitch/serializer";


export default class TwitchSearchChannelSerializer extends TwitchSerializer {
	modelNameFromPayloadKey = () => "twitch-search-channel";

	attrs = {
		channel: { deserialize: "records" }
	};

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		// fix payload format
		payload.channels = ( payload.channels || [] ).map( channel => ({ channel }) );

		return super.normalizeResponse( store, primaryModelClass, payload, id, requestType );
	}

	normalize( modelClass, resourceHash, prop ) {
		const foreignKey = this.store.serializerFor( "twitch-channel" ).primaryKey;

		// get the id of the embedded TwitchChannel record and apply it here
		resourceHash[ this.primaryKey ] = resourceHash.channel[ foreignKey ];

		return super.normalize( modelClass, resourceHash, prop );
	}
}
