define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		viewers: DS.attr( "number" ),
		channels: DS.attr( "number" ),
		game: DS.belongsTo( "twitchGame" )
	}).reopenClass({
		toString: function() { return "games/top"; }
	});

});
