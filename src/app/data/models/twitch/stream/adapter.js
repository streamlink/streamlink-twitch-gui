import TwitchAdapter from "data/models/twitch/adapter";


export default class TwitchStreamAdapter extends TwitchAdapter {
	coalesceFindRequests = true;
	findManyIdString = "channel";
}
