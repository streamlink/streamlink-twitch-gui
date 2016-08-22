import DS from "EmberData";


	var attr = DS.attr;
	var belongsTo = DS.belongsTo;


	export default DS.Model.extend({
		display_name: attr( "string" ),
		name: attr( "string" ),
		// always side-load the target relation
		target: belongsTo( "twitchStream", { async: true } )

	}).reopenClass({
		toString: function() { return "api/users/:user/followed/hosting"; }
	});
