import TwitchAdapter from "store/TwitchAdapter";


export default TwitchAdapter.extend({
	// use custom findRecord URL
	findRecord( store, type, id, snapshot ) {
		var url = this.buildURL( type, null, snapshot, "findRecord" );
		var data = {
			name: id
		};

		return this.ajax( url, "GET", { data: data } );
	},

	urlForFindRecord( id, type ) {
		return this._buildURL( type, "isFollowing" );
	},


	// use custom createRecord URL
	createRecord( store, type, snapshot ) {
		var url = this.buildURL( type, null, snapshot, "createRecord" );
		var data = {
			name: snapshot.id
		};

		return this.ajax( url, "PUT", { data: data } );
	},

	urlForCreateRecord( type ) {
		return this._buildURL( type, "follow" );
	},


	// use custom deleteRecord URL
	deleteRecord( store, type, snapshot ) {
		var url = this.buildURL( type, null, snapshot, "deleteRecord" );
		var data = {
			name: snapshot.id
		};

		return this.ajax( url , "DELETE", { data: data } );
	},

	urlForDeleteRecord( id, type ) {
		return this._buildURL( type, "unfollow" );
	}
});
