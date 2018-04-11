import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	primaryKey: "id",

	modelNameFromPayloadKey() {
		return "twitchStreamHosted";
	},

	normalize( modelClass, resourceHash, prop ) {
		// get the target _id property and use it as key for the twitchStream relation
		resourceHash.target = resourceHash.target._id;

		return this._super( modelClass, resourceHash, prop );
	}
});
