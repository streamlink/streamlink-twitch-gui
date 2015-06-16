define( [ "EmberData" ], function( DS ) {

	return DS.Model.extend({
		game: DS.belongsTo( "twitchGame" )
	}).reopenClass({
		toString: function() { return "kraken/search/games"; }
	});

});
