define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		checkagain: DS.attr( "number" )
	}).reopenClass({
		toString: function() { return "Versioncheck"; }
	});

});
