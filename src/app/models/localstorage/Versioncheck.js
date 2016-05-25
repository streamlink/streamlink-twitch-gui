define([
	"EmberData"
], function(
	DS
) {

	var attr = DS.attr;


	return DS.Model.extend({
		version: attr( "string", { defaultValue: "" } ),
		checkagain: attr( "number", { defaultValue: 0 } )

	}).reopenClass({
		toString: function() { return "Versioncheck"; }
	});

});
