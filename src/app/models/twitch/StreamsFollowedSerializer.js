define( [ "models/twitch/StreamSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		typeForRoot: function() {
			return "twitchStreamsFollowed";
		}
	});

});
