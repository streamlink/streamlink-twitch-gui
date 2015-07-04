define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		primaryKey: "id",

		attrs: {
			product: { deserialize: "records" }
		},

		modelNameFromPayloadKey: function() {
			return "twitchTicket";
		}
	});

});
