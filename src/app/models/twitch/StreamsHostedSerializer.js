import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	primaryKey: "id",

	modelNameFromPayloadKey() {
		return "twitchStreamsHosted";
	},

	normalize( modelClass, resourceHash, prop ) {
		// get the target _id property and use it as key for the twitchStream relation
		resourceHash.target = resourceHash.target._id;

		return this._super( modelClass, resourceHash, prop );
	}
});
