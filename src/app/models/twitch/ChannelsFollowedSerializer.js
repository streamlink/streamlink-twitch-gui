import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchChannelsFollowed";
	},

	attrs: {
		channel: { deserialize: "records" }
	},

	normalize( modelClass, resourceHash, prop ) {
		const foreignKey = this.store.serializerFor( "twitchChannel" ).primaryKey;

		// get the id of the embedded TwitchChannel record and apply it here
		resourceHash[ this.primaryKey ] = resourceHash.channel[ foreignKey ];

		return this._super( modelClass, resourceHash, prop );
	}
});
