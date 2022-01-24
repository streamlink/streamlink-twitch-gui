import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitch-search-channel";
	},

	normalize( modelClass, resourceHash, prop ) {
		resourceHash.user = resourceHash[ this.primaryKey ];
		resourceHash.game = resourceHash.game_id;
		delete resourceHash[ "game_id" ];

		return this._super( modelClass, resourceHash, prop );
	}
});
