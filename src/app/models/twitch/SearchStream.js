define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		stream: DS.belongsTo( "twitchStream" )
	}).reopenClass({
		toString: function() { return "search/streams"; }
	});

});
