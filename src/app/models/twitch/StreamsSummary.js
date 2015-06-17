define( [ "EmberData" ], function( DS ) {

	var attr = DS.attr;

	return DS.Model.extend({
		channels: attr( "number" ),
		viewers: attr( "number" )
	}).reopenClass({
		toString: function() { return "kraken/streams/summary"; }
	});

});
