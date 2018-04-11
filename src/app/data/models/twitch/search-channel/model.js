import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";


export default Model.extend({
	channel: belongsTo( "twitchChannel", { async: false } )

}).reopenClass({
	toString() { return "kraken/search/channels"; }
});
