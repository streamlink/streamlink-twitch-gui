define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		viewers: DS.attr( "number" ),
		game: DS.attr( "string" ),
		channel: DS.belongsTo( "twitchChannel" ),
		preview: DS.belongsTo( "twitchImage" )
	}).reopenClass({
		toString: function() { return "streams"; }
	});

});
