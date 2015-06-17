define( [ "EmberData" ], function( DS ) {

	var attr = DS.attr;

	return DS.Model.extend({
		checkagain: attr( "number" )
	}).reopenClass({
		toString: function() { return "Versioncheck"; }
	});

});
