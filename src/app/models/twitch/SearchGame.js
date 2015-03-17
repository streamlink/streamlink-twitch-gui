define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		game: DS.belongsTo( "twitchGame" )
	}).reopenClass({
		toString: function() { return "search/games"; }
	});

});
