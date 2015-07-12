define( [ "EmberData" ], function( DS ) {

	var attr = DS.attr;
	var belongsTo = DS.belongsTo;

	return DS.Model.extend({
		channels: attr( "number" ),
		game: belongsTo( "twitchGame" ),
		viewers: attr( "number" )
	}).reopenClass({
		toString: function() { return "kraken/games/top"; }
	});

});
