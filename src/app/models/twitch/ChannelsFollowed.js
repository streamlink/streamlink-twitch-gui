define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		channel: DS.belongsTo( "twitchChannel" ),
		created_at: DS.attr( "date" ),
		notifications: DS.attr( "boolean" )
	}).reopenClass({
		toString: function() { return "kraken/users/:user/follows/channels"; }
	});

});
