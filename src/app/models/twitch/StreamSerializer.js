define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		attrs: {
			channel: { deserialize: "records" },
			preview: { deserialize: "records" }
		},

		typeForRoot: function() {
			return "twitchStream";
		},

		normalize: function( type, hash, prop ) {
			// use the channel name as ID, so we can reload the record later on
			// ember-data uses the ID for querying the API for single records
			hash._id = hash.channel.name;
			return this._super.call( this, type, hash, prop );
		}
	});

});
