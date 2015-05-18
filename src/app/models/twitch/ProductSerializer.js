define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		primaryKey: "name",

		attrs: {
			emoticons: { deserialize: "records" }
		},

		typeForRoot: function() {
			return "twitchProduct";
		}
	});

});
