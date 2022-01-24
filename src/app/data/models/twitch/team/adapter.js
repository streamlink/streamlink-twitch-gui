import TwitchAdapter from "data/models/twitch/adapter";


export default TwitchAdapter.extend({
	query( store, type, query ) {
		const url = this._buildURL( "helix/teams/channel" );

		return this.ajax( url, "GET", { data: query } );
	}
});
