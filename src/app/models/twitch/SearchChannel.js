define( [ "EmberData" ], function( DS ) {

	var belongsTo = DS.belongsTo;

	return DS.Model.extend({
		channel: belongsTo( "twitchChannel" )
	}).reopenClass({
		toString: function() { return "kraken/search/channels"; }
	});

});
