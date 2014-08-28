define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		valid: DS.attr( "boolean" ),
		user_name: DS.attr( "string" )
	}).reopenClass({
		toString: function() { return ""; }
	});

});
