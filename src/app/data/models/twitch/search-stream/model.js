import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";


export default Model.extend({
	stream: belongsTo( "twitchStream", { async: false } )

}).reopenClass({
	toString() { return "kraken/search/streams"; }
});
