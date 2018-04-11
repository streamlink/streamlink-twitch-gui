import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitchGameFollowedLive";
	},

	attrs: {
		game: { deserialize: "records" }
	},

	normalize( modelClass, resourceHash, prop ) {
		const foreignKey = this.store.serializerFor( "twitchGame" ).primaryKey;

		// fix payload format
		resourceHash.game = { game: resourceHash.game };

		// get the id of the embedded TwitchGame record and apply it here
		resourceHash[ this.primaryKey ] = resourceHash.game.game[ foreignKey ];

		return this._super( modelClass, resourceHash, prop );
	}
});
