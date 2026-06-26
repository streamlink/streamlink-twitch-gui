import TwitchAdapter from "data/models/twitch/adapter";


export default TwitchAdapter.extend({
	/**
	 * @param {DS.Store} store
	 * @param {DS.Model} type
	 * @param {Object} query
	 * @return {Promise}
	 */
	async queryRecord( store, type, query ) {
		const url = this._buildURL( type );
		const data = await this.ajax( url, "GET", { data: query } );

		/* istanbul ignore else */
		if ( data !== null && Array.isArray( data[ "data" ] ) && data[ "data" ][ 0 ] ) {
			data[ "data" ][ 0 ][ "_query" ] = query;
		}

		return data;
	}
});
