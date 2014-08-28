define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		attrs: {
			channel: { deserialize: "records" },
			preview: { deserialize: "records" }
		},

		typeForRoot: function() {
			return "twitchStream";
		}
	});

});
