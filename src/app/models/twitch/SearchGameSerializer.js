define( [ "models/twitch/GameSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		typeForRoot: function() {
			return "twitchSearchGame";
		}
	});

});
