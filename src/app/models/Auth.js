define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		access_token: DS.attr( "string" ),
		scope: DS.attr( "string" ),
		date: DS.attr( "date" )
	}).reopenClass({
		toString: function() { return "Auth"; }
	});

});
