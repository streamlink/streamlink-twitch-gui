define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		name: DS.attr( "string" ),
		giantbomb_id: DS.attr( "number" ),
		box: DS.belongsTo( "twitchImage" ),
		logo: DS.belongsTo( "twitchImage" )
	}).reopenClass({
		toString: function() { return "games"; }
	});

});
