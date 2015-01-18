define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		channel   : DS.belongsTo( "twitchChannel" ),
		created_at: DS.attr( "date" )
	}).reopenClass({
		toString: function() { return "users/:user/subscriptions"; }
	});

});
