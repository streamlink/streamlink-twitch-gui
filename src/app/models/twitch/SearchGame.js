define( [ "EmberData" ], function( DS ) {

	var belongsTo = DS.belongsTo;

	return DS.Model.extend({
		game: belongsTo( "twitchGame", { async: false } )
	}).reopenClass({
		toString: function() { return "kraken/search/games"; }
	});

});
