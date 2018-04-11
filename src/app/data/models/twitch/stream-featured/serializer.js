import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchStreamFeatured";
	},

	attrs: {
		stream: { deserialize: "records" }
	},

	normalize( modelClass, resourceHash, prop ) {
		const foreignKey = this.store.serializerFor( "twitchChannel" ).primaryKey;

		// get the id of the embedded TwitchChannel record and apply it here
		resourceHash[ this.primaryKey ] = resourceHash.stream.channel[ foreignKey ];

		return this._super( modelClass, resourceHash, prop );
	}
});
