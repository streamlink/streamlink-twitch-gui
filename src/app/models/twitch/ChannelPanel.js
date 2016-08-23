import {
	hasMany,
	Model
} from "EmberData";


export default Model.extend({
	panels: hasMany( "twitchChannelPanelItem" )

}).reopenClass({
	toString: function() { return "api/channels/:id/panels"; }
});
