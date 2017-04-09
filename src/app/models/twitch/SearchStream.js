import {
	belongsTo,
	Model
} from "ember-data";


export default Model.extend({
	stream: belongsTo( "twitchStream", { async: false } )

}).reopenClass({
	toString() { return "kraken/search/streams"; }
});
