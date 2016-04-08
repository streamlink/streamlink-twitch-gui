define([
	"EmberData"
], function(
	DS
) {

	var attr = DS.attr;
	var belongsTo = DS.belongsTo;


	return DS.Model.extend({
		image: attr( "string" ),
		priority: attr( "number" ),
		scheduled: attr( "boolean" ),
		sponsored: attr( "boolean" ),
		stream: belongsTo( "twitchStream", { async: false } ),
		text: attr( "string" ),
		title: attr( "string" )

	}).reopenClass({
		toString: function() { return "kraken/streams/featured"; }
	});

});
