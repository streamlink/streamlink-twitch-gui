import TwitchAdapter from "data/models/twitch/adapter";


export default TwitchAdapter.extend({
	// automatically turns multiple findRecord calls into a single findMany call
	coalesceFindRequests: true,
	// and uses "login" as query string parameter for the IDs, as defined by the TwitchAdapter
	findManyIdString: "login",

	/**
	 * @param {DS.Store} store
	 * @param {DS.Model} type
	 * @param {string} id
	 * @param {DS.Snapshot} snapshot
	 * @return {Promise}
	 */
	findRecord( store, type, id, snapshot ) {
		const url = this.buildURL( type, null, snapshot, "findRecord" );
		const data = {
			login: id
		};

		return this.ajax( url, "GET", { data: data } );
	},

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
