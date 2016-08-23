import {
	belongsTo,
	Model
} from "EmberData";


export default Model.extend({
	channel: belongsTo( "twitchChannel", { async: false } )

}).reopenClass({
	toString() { return "kraken/search/channels"; }
});
