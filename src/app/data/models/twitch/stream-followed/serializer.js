import TwitchSerializer from "data/models/twitch/serializer";


export default class TwitchStreamFollowedSerializer extends TwitchSerializer {
	modelNameFromPayloadKey = () => "twitch-stream-followed";

	attrs = {
		stream: { deserialize: "records" }
	};

	normalizeResponse( store, primaryModelClass, payload, id, requestType ) {
		// fix payload format
		payload.streams = ( payload.streams || [] ).map( stream => ({ stream }) );

		return super.normalizeResponse( store, primaryModelClass, payload, id, requestType );
	}

	normalize( modelClass, resourceHash, prop ) {
		const foreignKey = this.store.serializerFor( "twitch-channel" ).primaryKey;

		// get the id of the embedded TwitchChannel record and apply it here
		resourceHash[ this.primaryKey ] = resourceHash.stream.channel[ foreignKey ];

		return super.normalize( modelClass, resourceHash, prop );
	}
}
