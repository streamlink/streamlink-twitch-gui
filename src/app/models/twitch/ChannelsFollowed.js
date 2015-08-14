define( [ "EmberData" ], function( DS ) {

	var attr = DS.attr;
	var belongsTo = DS.belongsTo;

	return DS.Model.extend({
		channel: belongsTo( "twitchChannel", { async: false } ),
		created_at: attr( "date" ),
		notifications: attr( "boolean" )
	}).reopenClass({
		toString: function() { return "kraken/users/:user/follows/channels"; }
	});

});
