define([
	"EmberData"
], function(
	DS
) {

	var attr = DS.attr;


	return DS.Model.extend({
		// pass through
		authorization: attr(),
		user_name: attr( "string" ),
		valid: attr( "boolean" )

	}).reopenClass({
		toString: function() { return "kraken/"; }
	});

});
