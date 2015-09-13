define( [ "EmberData" ], function( DS ) {

	var attr = DS.attr;

	return DS.Model.extend({
		created_at   : attr( "date" ),
		notifications: attr( "boolean" )
	}).reopenClass({
		toString: function() { return "kraken/users/:user/follows/channels"; }
	});

});
