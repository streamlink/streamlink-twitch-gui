import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitch-user";
	},

	normalize( modelClass, resourceHash, prop ) {
		// add keys for custom channel and stream relationships
		resourceHash.channel = resourceHash.stream = resourceHash[ this.primaryKey ];

		return this._super( modelClass, resourceHash, prop );
	}
});
