define( [ "store/TwitchSerializer" ], function( TwitchSerializer ) {

	return TwitchSerializer.extend({
		typeForRoot: function() {
			return "twitchTeam";
		}
	});

});
