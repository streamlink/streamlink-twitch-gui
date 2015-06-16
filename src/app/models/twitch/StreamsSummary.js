define( [ "EmberData" ], function( DS ) {

	return DS.Model.extend({
		channels: DS.attr( "number" ),
		viewers: DS.attr( "number" )
	}).reopenClass({
		toString: function() { return "kraken/streams/summary"; }
	});

});
