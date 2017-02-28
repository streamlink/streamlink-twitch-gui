import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchStreamFeatured";
	},

	attrs: {
		stream: { deserialize: "records" }
	},

	normalize( modelClass, resourceHash, prop ) {
		const foreignKey = this.store.serializerFor( "twitchStream" ).primaryKey;

		// get the id of the embedded TwitchStream record and apply it here
		resourceHash[ this.primaryKey ] = resourceHash.stream[ foreignKey ];

		return this._super( modelClass, resourceHash, prop );
	}
});
