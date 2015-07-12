define( [ "EmberData" ], function( DS ) {

	var belongsTo = DS.belongsTo;

	return DS.Model.extend({
		stream: belongsTo( "twitchStream" )
	}).reopenClass({
		toString: function() { return "kraken/search/streams"; }
	});

});
