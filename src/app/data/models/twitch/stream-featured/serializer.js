import TwitchSerializer from "data/models/twitch/serializer";


export default class TwitchStreamFeaturedSerializer extends TwitchSerializer {
	modelNameFromPayloadKey = () => "twitch-stream-featured";

	attrs = {
		stream: { deserialize: "records" }
	};

	normalize( modelClass, resourceHash, prop ) {
		const foreignKey = this.store.serializerFor( "twitch-channel" ).primaryKey;

		// get the id of the embedded TwitchChannel record and apply it here
		resourceHash[ this.primaryKey ] = resourceHash.stream.channel[ foreignKey ];

		return super.normalize( modelClass, resourceHash, prop );
	}
}
