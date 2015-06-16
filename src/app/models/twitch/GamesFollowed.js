define( [ "EmberData" ], function( DS ) {

	return DS.Model.extend({
		box: DS.belongsTo( "twitchImage" ),
		giantbomb_id: DS.attr( "number" ),
		logo: DS.belongsTo( "twitchImage" ),
		name: DS.attr( "string" ),
		properties: DS.attr( "number" )
	}).reopenClass({
		toString: function() { return "api/users/:user/follows/games"; }
	});

});
