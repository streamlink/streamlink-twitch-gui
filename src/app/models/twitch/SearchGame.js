define( [ "EmberData" ], function( DS ) {

	var belongsTo = DS.belongsTo;

	return DS.Model.extend({
		game: belongsTo( "twitchGame" )
	}).reopenClass({
		toString: function() { return "kraken/search/games"; }
	});

});
