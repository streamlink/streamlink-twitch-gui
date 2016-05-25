define([
	"store/TwitchSerializer"
], function(
	TwitchSerializer
) {

	return TwitchSerializer.extend({
		primaryKey: "regex",

		modelNameFromPayloadKey: function() {
			return "twitchProductEmoticon";
		}
	});

});
