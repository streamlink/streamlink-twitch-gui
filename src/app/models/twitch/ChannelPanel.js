import {
	hasMany,
	Model
} from "EmberData";


export default Model.extend({
	panels: hasMany( "twitchChannelPanelItem" )

}).reopenClass({
	toString() { return "api/channels/:id/panels"; }
});
