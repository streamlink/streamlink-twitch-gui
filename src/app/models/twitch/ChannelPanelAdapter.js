import TwitchAdapter from "store/TwitchAdapter";


export default TwitchAdapter.extend({
	query( store, type, query ) {
		const url = this.buildURL( type, null, null, "query", query );
		query = this.sortQueryParams ? this.sortQueryParams( query ) : query;

		return this.ajax( url, "GET", { data: {} } );
	},

	urlForQuery( query, type ) {
		return this._buildURL( type, query );
	},

	buildURLFragments( type, query ) {
		let path = type.toString();
		path = path.replace( ":channel", query.channel );

		return path.split( "/" );
	}
});
