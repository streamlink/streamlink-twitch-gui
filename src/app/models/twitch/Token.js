import DS from "EmberData";


	var attr = DS.attr;


	export default DS.Model.extend({
		// pass through
		authorization: attr(),
		user_name: attr( "string" ),
		valid: attr( "boolean" )

	}).reopenClass({
		toString: function() { return "kraken/"; }
	});
