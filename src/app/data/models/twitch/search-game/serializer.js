import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitch-search-game";
	},

	attrs: {
		game: { deserialize: "records" }
	},

	normalize( modelClass, resourceHash, prop ) {
		const { primaryKey } = this;
		resourceHash = {
			[ primaryKey ]: resourceHash[ primaryKey ],
			game: resourceHash
		};

		return this._super( modelClass, resourceHash, prop );
	}
});
