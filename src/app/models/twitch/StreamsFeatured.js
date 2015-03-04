define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		image: DS.attr( "string" ),
		priority: DS.attr( "number" ),
		scheduled: DS.attr( "boolean" ),
		sponsored: DS.attr( "boolean" ),
		stream: DS.belongsTo( "twitchStream" ),
		text: DS.attr( "string" ),
		title: DS.attr( "string" )
	}).reopenClass({
		toString: function() { return "streams/featured"; }
	});

});
