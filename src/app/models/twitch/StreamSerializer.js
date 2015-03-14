define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		attrs: {
			channel: { deserialize: "records" },
			preview: { deserialize: "records" }
		},

		normalize: function( type, hash ) {
			if ( hash.preview ) {
				hash.preview._id = hash.channel.name;
			}
			return this._super.apply( this, arguments );
		},

		typeForRoot: function() {
			return "twitchStream";
		}
	});

});
