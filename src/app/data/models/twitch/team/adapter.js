import TwitchAdapter from "data/models/twitch/adapter";


export default class TwitchTeamAdapter extends TwitchAdapter {
	query( store, type, query ) {
		const url = this.buildURL( type, null, null, "query", query );
		delete query.channel;
		query = this.sortQueryParams ? this.sortQueryParams( query ) : query;

		return this.ajax( url, "GET", { data: query } );
	}

	urlForQuery( query ) {
		// use this approach until EmberData ships the new ds-improved-ajax feature
		if ( query && query.channel ) {
			//noinspection JSCheckFunctionSignatures
			return this._buildURL( `kraken/channels/${query.channel}/teams` );
		}

		return super.urlForQuery( ...arguments );
	}
}
