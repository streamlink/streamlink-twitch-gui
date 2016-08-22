import DS from "EmberData";


	var attr = DS.attr;
	var belongsTo = DS.belongsTo;


	export default DS.Model.extend({
		box: belongsTo( "twitchImage", { async: false } ),
		giantbomb_id: attr( "number" ),
		logo: belongsTo( "twitchImage", { async: false } ),
		name: attr( "string" ),
		popularity: attr( "number" ),
		properties: attr()

	}).reopenClass({
		toString: function() { return "kraken/games"; }
	});
