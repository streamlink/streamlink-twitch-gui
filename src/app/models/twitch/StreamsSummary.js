import DS from "EmberData";


	var attr = DS.attr;


	export default DS.Model.extend({
		channels: attr( "number" ),
		viewers: attr( "number" )

	}).reopenClass({
		toString: function() { return "kraken/streams/summary"; }
	});
