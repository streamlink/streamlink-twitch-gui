import {
	belongsTo,
	Model
} from "ember-data";


export default Model.extend({
	channel: belongsTo( "twitchChannel", { async: false } )

}).reopenClass({
	toString() { return "kraken/search/channels"; }
});
