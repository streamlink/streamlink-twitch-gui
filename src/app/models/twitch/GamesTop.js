define( [ "EmberData" ], function( DS ) {

	return DS.Model.extend({
		channels: DS.attr( "number" ),
		game: DS.belongsTo( "twitchGame" ),
		viewers: DS.attr( "number" )
	}).reopenClass({
		toString: function() { return "kraken/games/top"; }
	});

});
