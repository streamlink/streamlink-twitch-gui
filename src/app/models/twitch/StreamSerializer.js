define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		attrs: {
			channel: { deserialize: "records" },
			preview: { deserialize: "records" }
		},

		typeForRoot: function() {
			return "twitchStream";
		},

		normalize: function( type, hash ) {
			if ( hash.preview && hash.channel ) {
				hash.preview._id = hash.channel.name;
			}
			return this._super.apply( this, arguments );
		},

		/**
		 * Use the channel name as stream record ID, so we can .refresh() it.
		 * The adapter will use the ID for building the URL.
		 */
		normalizeId: function( hash ) {
			if ( !hash.channel ) {
				return this._super.apply( this, arguments );
			}
			hash.id = hash.channel.name;
			delete hash._id;
		}
	});

});
