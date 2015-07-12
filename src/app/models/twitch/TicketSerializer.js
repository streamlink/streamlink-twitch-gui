define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		primaryKey: "id",

		modelNameFromPayloadKey: function() {
			return "twitchTicket";
		},

		attrs: {
			product: { deserialize: "records" }
		}
	});

});
