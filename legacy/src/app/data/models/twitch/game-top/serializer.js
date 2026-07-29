import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitch-game-top";
	},

	attrs: {
		game: { deserialize: "records" }
	},

	normalize( modelClass, resourceHash, prop ) {
		const foreignKey = this.store.serializerFor( "twitch-game" ).primaryKey;
		resourceHash = {
			[ this.primaryKey ]: resourceHash[ foreignKey ],
			game: resourceHash
		};

		return this._super( modelClass, resourceHash, prop );
	}
});
