define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		primaryKey: "id",

		attrs: {
			product: { deserialize: "records" }
		},

		typeForRoot: function() {
			return "twitchTicket";
		}
	});

});
