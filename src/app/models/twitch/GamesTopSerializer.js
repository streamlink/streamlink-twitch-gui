import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey: function() {
		return "twitchGamesTop";
	},

	attrs: {
		game: { deserialize: "records" }
	},

	normalize: function( modelClass, resourceHash, prop ) {
		var foreignKey = this.store.serializerFor( "twitchGame" ).primaryKey;
		resourceHash[ this.primaryKey ] = resourceHash.game[ foreignKey ];

		return this._super( modelClass, resourceHash, prop );
	}
});
