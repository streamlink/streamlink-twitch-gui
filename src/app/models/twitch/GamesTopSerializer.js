import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchGamesTop";
	},

	attrs: {
		game: { deserialize: "records" }
	},

	normalize( modelClass, resourceHash, prop ) {
		const foreignKey = this.store.serializerFor( "twitchGame" ).primaryKey;

		// get the id of the embedded TwitchGame record and apply it here
		resourceHash[ this.primaryKey ] = resourceHash.game[ foreignKey ];

		return this._super( modelClass, resourceHash, prop );
	}
});
