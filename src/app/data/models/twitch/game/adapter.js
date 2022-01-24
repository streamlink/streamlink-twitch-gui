import TwitchAdapter from "data/models/twitch/adapter";


const returnFalse = () => false;


export default TwitchAdapter.extend({
	coalesceFindRequests: true,

	// never reload TwitchGame records
	shouldReloadRecord: returnFalse,
	shouldBackgroundReloadRecord: returnFalse
});
