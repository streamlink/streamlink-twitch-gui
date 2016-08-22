import DS from "EmberData";


	var attr = DS.attr;


	export default DS.Model.extend({
		version: attr( "string", { defaultValue: "" } ),
		checkagain: attr( "number", { defaultValue: 0 } )

	}).reopenClass({
		toString: function() { return "Versioncheck"; }
	});
