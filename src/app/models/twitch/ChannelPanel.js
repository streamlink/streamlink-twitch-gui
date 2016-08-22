import DS from "EmberData";


	var hasMany = DS.hasMany;


	export default DS.Model.extend({
		panels: hasMany( "twitchChannelPanelItem" )

	}).reopenClass({
		toString: function() { return "api/channels/:id/panels"; }
	});
