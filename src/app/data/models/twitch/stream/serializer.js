import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchStream";
	},

	attrs: {
		channel: { deserialize: "records" },
		preview: { deserialize: "records" }
	},

	normalize( modelClass, resourceHash, prop ) {
		const foreignKeyChannel = this.store.serializerFor( "twitchChannel" ).primaryKey;
		const foreignKeyImage = this.store.serializerFor( "twitchImage" ).primaryKey;

		// get the id of the embedded TwitchChannel record and apply it here
		// this is required for refreshing the record so that the correct id is being used
		const id = resourceHash.channel[ foreignKeyChannel ];
		resourceHash[ this.primaryKey ] = id;

		// apply the id of this record on the embedded TwitchImage record (preview)
		if ( resourceHash.preview ) {
			resourceHash.preview[ foreignKeyImage ] = `stream/preview/${id}`;
		}

		return this._super( modelClass, resourceHash, prop );
	}
});
