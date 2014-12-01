define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		// we don't care about the authorization attribute, since it only contains the requested
		// scope and timestamps of the login
		authorization: DS.attr(),
		user_name: DS.attr( "string" ),
		valid: DS.attr( "boolean" )
	}).reopenClass({
		toString: function() { return ""; }
	});

});
