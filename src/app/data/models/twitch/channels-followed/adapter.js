import TwitchAdapter from "data/models/twitch/adapter";


export default TwitchAdapter.extend({
	/**
	 * @param {DS.Store} store
	 * @param {DS.Model} type
	 * @param {Object} query
	 * @return {Promise}
	 */
	async query( store, type, query ) {
		const data = await this._super( store, type, query );

		// HACK:
		// Since the `TwitchChannelsFollowedSerializer` doesn't have access to
		// the requested `user_id` query parameter, and since the `user_id` is needed
		// for having unique primary keys (as the JSON response doesn't include it),
		// add the whole query to each response item, so that the serializer's normalize() method
		// can access the data.
		// Technically, this is not needed, because we're only accessing the followed channels
		// of the logged-in user and not any other user, but should this be changed and a route
		// gets added which lists followed channels of different users, then we need primary keys
		// of the `TwitchChannelsFollowed` records that depend on the `user_id` and `broadcaster_id`
		/* istanbul ignore else */
		if ( data !== null && Array.isArray( data[ "data" ] ) ) {
			for ( let item of data[ "data" ] ) {
				item[ "_query" ] = query;
			}
		}

		return data;
	}
});
