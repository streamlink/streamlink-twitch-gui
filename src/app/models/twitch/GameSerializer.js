define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		attrs: {
			box: { deserialize: "records" },
			logo: { deserialize: "records" }
		},

		typeForRoot: function() {
			return "twitchGame";
		}
	});

});
