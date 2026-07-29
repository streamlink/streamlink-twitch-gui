import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	primaryKey: "broadcaster_id",

	modelNameFromPayloadKey() {
		return "twitch-channel";
	},

	normalize( modelClass, resourceHash, prop ) {
		if ( resourceHash[ "broadcaster_language" ] === "id" ) {
			resourceHash[ "broadcaster_language" ] = "ID";
		}

		return this._super( modelClass, resourceHash, prop );
	}
});
