define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		modelNameFromPayloadKey: function() {
			return "twitchStream";
		},

		attrs: {
			channel: { deserialize: "records" },
			preview: { deserialize: "records" }
		},

		/**
		 * Use the channel name as stream record ID, so we can .refresh() it.
		 * The adapter will use the ID for building the URL.
		 */
		normalize: function( modelClass, resourceHash, prop ) {
			var primaryKey        = this.primaryKey;
			var foreignKeyChannel = this.store.serializerFor( "twitchChannel" ).primaryKey;
			var foreignKeyImage   = this.store.serializerFor( "twitchImage" ).primaryKey;
			var name = resourceHash.channel[ foreignKeyChannel ];

			resourceHash[ primaryKey ] = name;
			if ( resourceHash.preview ) {
				resourceHash.preview[ foreignKeyImage ] = "stream/preview/%@".fmt( name );
			}

			return this._super( modelClass, resourceHash, prop );
		}
	});

});
