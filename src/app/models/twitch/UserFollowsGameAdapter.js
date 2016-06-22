define([
	"store/TwitchAdapter"
], function(
	TwitchAdapter
) {

	return TwitchAdapter.extend({
		findRecord: function( store, type, id, snapshot ) {
			var url = this.buildURL( type, "isFollowing", snapshot, "findRecord" );
			var data = {
				name: id
			};

			return this.ajax( url, "GET", { data: data } );
		}
	});

});
