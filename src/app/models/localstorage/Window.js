import DS from "EmberData";


	var attr = DS.attr;


	export default DS.Model.extend({
		width : attr( "number", { defaultValue: null } ),
		height: attr( "number", { defaultValue: null } ),
		x     : attr( "number", { defaultValue: null } ),
		y     : attr( "number", { defaultValue: null } )

	}).reopenClass({
		toString: function() { return "Window"; }
	});
