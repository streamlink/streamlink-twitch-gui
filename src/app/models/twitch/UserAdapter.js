import TwitchAdapter from "store/TwitchAdapter";


export default TwitchAdapter.extend( {
	// use custom findRecord URL
	findRecord( store, type, id, snapshot ) {
		const url = this.buildURL( type, null, snapshot, "findRecord" );
		const data = {
			login: id
		};

		return this.ajax( url, "GET", { data: data } );
	},

	urlForFindRecord( id, type ) {
		return this._buildURL( type );
	}
});
