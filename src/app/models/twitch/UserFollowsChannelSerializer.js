define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		primaryKey: "id",

		modelNameFromPayloadKey: function() {
			return "twitchUserFollowsChannel";
		},

		attrs: {
			channel: { deserialize: "records" }
		},

		normalizePayload: function( payload ) {
			// expected payload
			if ( payload.follows ) { return payload; }
			// unexpected payload: normalize it! also don't forget to set a proper ID
			if ( !payload.id ) { payload.id = payload.channel.name; }
			return { follows: payload };
		},

		normalizeHash: {
			follows: function( hash ) {
				if ( !hash.id ) { hash.id = hash.channel.name; }
				return hash;
			}
		}
	});

});
