define([
	"EmberData"
], function(
	DS
) {

	var belongsTo = DS.belongsTo;


	return DS.Model.extend({
		stream: belongsTo( "twitchStream", { async: false } )

	}).reopenClass({
		toString: function() { return "kraken/streams/followed"; }
	});

});
