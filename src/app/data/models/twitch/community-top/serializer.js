import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	// the API documentation is wrong
	//primaryKey: "id",

	modelNameFromPayloadKey() {
		return "twitchCommunityTop";
	}
});
