define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		channel: DS.belongsTo( "twitchChannel" ),
		created_at: DS.attr( "date" ),
		game: DS.attr( "string" ),
		preview: DS.belongsTo( "twitchImage" ),
		viewers: DS.attr( "number" )
	}).reopenClass({
		toString: function() { return "streams"; }
	});

});
