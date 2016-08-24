import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchStreamsFeatured";
	},

	attrs: {
		stream: { deserialize: "records" }
	},

	normalize( modelClass, resourceHash, prop ) {
		var foreignKey = this.store.serializerFor( "twitchChannel" ).primaryKey;
		resourceHash[ this.primaryKey ] = resourceHash.stream.channel[ foreignKey ];

		return this._super( modelClass, resourceHash, prop );
	}
});
