import TwitchAdapter from "data/models/twitch/adapter";


export default TwitchAdapter.extend({
	coalesceFindRequests: true,

	/**
	 * @param {string} id
	 * @param {DS.Model} type
	 * @return {string}
	 */
	urlForFindRecord( id, type ) {
		return this._buildURL( type );
	},

	/**
	 * @param {DS.Store} store
	 * @param {DS.Model} type
	 * @param {(Object|string)} query
	 * @return {Promise}
	 */
	queryRecord( store, type, query ) {
		/* istanbul ignore else */
		if ( typeof query !== "object" ) {
			query = { login: query };
		}
		const url = this.buildURL( type, null, null, "queryRecord", query );

		return this.ajax( url, "GET", { data: query } );
	},

	/**
	 * @param {Object} query
	 * @param {DS.Model} type
	 * @return {string}
	 */
	urlForQueryRecord( query, type ) {
		return this._buildURL( type );
	}
});
