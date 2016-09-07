import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	primaryKey: "name",

	modelNameFromPayloadKey() {
		return "twitchStreamsHosted";
	},

	normalize( modelClass, resourceHash, prop ) {
		// get the target object's channel name property and use it as twitchStream foreign key
		resourceHash.target = resourceHash.target.id;
		delete resourceHash.logo;

		return this._super( modelClass, resourceHash, prop );
	}
});
