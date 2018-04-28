import TwitchAdapter from "data/models/twitch/adapter";


export default TwitchAdapter.extend({
	urlFragments: {
		channel( type, id, data ) {
			return data.channel;
		}
	},

	query( store, type, query ) {
		const url = this.buildURL( type, null, null, "query", query );
		query = this.sortQueryParams ? this.sortQueryParams( query ) : query;

		return this.ajax( url, "GET", { data: {} } );
	},

	urlForQuery( query, type ) {
		return this._buildURL( type, null, query );
	}
});
