import TwitchAdapter from "store/TwitchAdapter";


export default TwitchAdapter.extend({
	// use custom findRecord URL
	findRecord: function( store, type, id, snapshot ) {
		var url = this.buildURL( type, null, snapshot, "findRecord" );
		var data = {
			name: id
		};

		return this.ajax( url, "GET", { data: data } );
	},

	urlForFindRecord: function( id, type ) {
		return this._buildURL( type, "isFollowing" );
	},


	// use custom createRecord URL
	createRecord: function( store, type, snapshot ) {
		var url = this.buildURL( type, null, snapshot, "createRecord" );
		var data = {
			name: snapshot.id
		};

		return this.ajax( url, "PUT", { data: data } );
	},

	urlForCreateRecord: function( type ) {
		return this._buildURL( type, "follow" );
	},


	// use custom deleteRecord URL
	deleteRecord: function( store, type, snapshot ) {
		var url = this.buildURL( type, null, snapshot, "deleteRecord" );
		var data = {
			name: snapshot.id
		};

		return this.ajax( url , "DELETE", { data: data } );
	},

	urlForDeleteRecord: function( id, type ) {
		return this._buildURL( type, "unfollow" );
	}
});
