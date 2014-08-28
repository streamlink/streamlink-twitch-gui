define( [ "models/twitch/Stream" ], function( Stream ) {

	return Stream.extend().reopenClass({
		toString: function() { return "streams/followed"; }
	});

});
