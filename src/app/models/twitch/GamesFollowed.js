define( [ "EmberData" ], function( DS ) {

	var attr = DS.attr;
	var belongsTo = DS.belongsTo;

	return DS.Model.extend({
		box: belongsTo( "twitchImage" ),
		giantbomb_id: attr( "number" ),
		logo: belongsTo( "twitchImage" ),
		name: attr( "string" ),
		properties: attr( "number" )
	}).reopenClass({
		toString: function() { return "api/users/:user/follows/games"; }
	});

});
