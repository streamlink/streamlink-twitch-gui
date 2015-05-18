define( [ "ember-data" ], function( DS ) {

	// These records have a different structure than /kraken/chat/emoticons
	// So we're defining another model explicitly for those

	return DS.Model.extend({
		regex: DS.attr( "string" ),
		regex_display: DS.attr( "string" ),
		state: DS.attr( "string" ),
		url: DS.attr( "string" )
	}).reopenClass({
		toString: function() { return "twitchProductEmoticon"; }
	});

});
