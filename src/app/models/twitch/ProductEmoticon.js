define([
	"EmberData"
], function(
	DS
) {

	var attr = DS.attr;


	// These records have a different structure in comparison to /kraken/chat/emoticons
	// So we're defining another model explicitly for those
	return DS.Model.extend({
		regex: attr( "string" ),
		regex_display: attr( "string" ),
		state: attr( "string" ),
		url: attr( "string" )

	}).reopenClass({
		toString: function() { return "twitchProductEmoticon"; }
	});

});
