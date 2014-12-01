define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		box: DS.belongsTo( "twitchImage" ),
		giantbomb_id: DS.attr( "number" ),
		logo: DS.belongsTo( "twitchImage" ),
		name: DS.attr( "string" )
	}).reopenClass({
		toString: function() { return "games"; }
	});

});
