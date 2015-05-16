define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		// pass through
		authorization: DS.attr(),
		user_name: DS.attr( "string" ),
		valid: DS.attr( "boolean" )
	}).reopenClass({
		toString: function() { return "kraken/"; }
	});

});
