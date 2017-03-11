import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	// the API documentation is wrong
	//primaryKey: "id",

	modelNameFromPayloadKey() {
		return "twitchCommunityTop";
	}
});
