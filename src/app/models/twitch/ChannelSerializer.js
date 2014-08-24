define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		attrs : {
			teams: { deserialize: "records" }
		},

		typeForRoot: function() {
			return "twitchChannel";
		}
	});

});
