define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		channel: DS.belongsTo( "twitchChannel" )
	}).reopenClass({
		toString: function() { return "kraken/search/channels"; }
	});

});
