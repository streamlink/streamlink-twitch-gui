define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		primaryKey: "regex",

		typeForRoot: function() {
			return "twitchProductEmoticon";
		}
	});

});
