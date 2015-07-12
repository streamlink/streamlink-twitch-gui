define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		primaryKey: "name",

		modelNameFromPayloadKey: function() {
			return "twitchProduct";
		},

		attrs: {
			emoticons: { deserialize: "records" }
		}
	});

});
