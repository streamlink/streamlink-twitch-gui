import TwitchAdapter from "store/TwitchAdapter";


export default TwitchAdapter.extend({
	coalesceFindRequests: true,
	findManyIdString: "channel"
});
