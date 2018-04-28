import TwitchAdapter from "data/models/twitch/adapter";


export default TwitchAdapter.extend({
	coalesceFindRequests: true,
	findManyIdString: "channel"
});
