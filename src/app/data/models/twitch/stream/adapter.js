import TwitchAdapter from "data/models/twitch/adapter";


export default TwitchAdapter.extend({
	coalesceFindRequests: true,

	/**
	 * @param {DS.Store} store
	 * @param {DS.Model} type
	 * @param {Object} query
	 * @return {Promise}
	 */
	queryRecord( store, type, query ) {
		const url = this._buildURL( type );

		return this.ajax( url, "GET", { data: query } );
	}
});
