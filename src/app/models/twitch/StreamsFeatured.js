define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		image: DS.attr( "string" ),
		text: DS.attr( "string" ),
		stream: DS.belongsTo( "twitchStream" )
	}).reopenClass({
		toString: function() { return "streams/featured"; }
	});

});
