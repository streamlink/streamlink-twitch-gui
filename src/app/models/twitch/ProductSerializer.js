define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		primaryKey: "name",

		attrs: {
			emoticons: { deserialize: "records" }
		},

		modelNameFromPayloadKey: function() {
			return "twitchProduct";
		}
	});

});
