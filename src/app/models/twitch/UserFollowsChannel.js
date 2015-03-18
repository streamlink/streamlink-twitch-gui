define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		// pass through: don't update the channel record
		channel      : DS.attr(),
		created_at   : DS.attr( "date" ),
		notifications: DS.attr( "boolean" )
	}).reopenClass({
		toString: function() { return "users/:user/follows/channels"; }
	});

});
