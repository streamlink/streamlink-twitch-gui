import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitch-stream-followed";
	},

	attrs: {
		stream: { deserialize: "records" }
	},

	normalize( modelClass, resourceHash, prop ) {
		const foreignKey = this.store.serializerFor( "twitch-stream" ).primaryKey;
		resourceHash = {
			[ this.primaryKey ]: resourceHash[ foreignKey ],
			stream: resourceHash
		};

		return this._super( modelClass, resourceHash, prop );
	}
});
