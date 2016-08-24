import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchGamesTop";
	},

	attrs: {
		game: { deserialize: "records" }
	},

	normalize( modelClass, resourceHash, prop ) {
		var foreignKey = this.store.serializerFor( "twitchGame" ).primaryKey;
		resourceHash[ this.primaryKey ] = resourceHash.game[ foreignKey ];

		return this._super( modelClass, resourceHash, prop );
	}
});
