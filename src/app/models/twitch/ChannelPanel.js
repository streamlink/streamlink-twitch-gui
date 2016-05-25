define([
	"EmberData"
], function(
	DS
) {

	var hasMany = DS.hasMany;


	return DS.Model.extend({
		panels: hasMany( "twitchChannelPanelItem" )

	}).reopenClass({
		toString: function() { return "api/channels/:id/panels"; }
	});

});
