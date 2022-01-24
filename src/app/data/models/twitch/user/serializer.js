import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitch-user";
	},

	normalize( modelClass, resourceHash, prop ) {
		// add key for custom channel relationship
		resourceHash.channel = resourceHash[ this.primaryKey ];

		return this._super( modelClass, resourceHash, prop );
	}
});
