define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		// pass through: don't update the channel record
		channel   : DS.attr(),
		created_at: DS.attr( "date" )
	}).reopenClass({
		toString: function() { return "users/:user/subscriptions"; }
	});

});
