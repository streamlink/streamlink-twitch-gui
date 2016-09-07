import {
	belongsTo,
	Model
} from "EmberData";


export default Model.extend({
	stream: belongsTo( "twitchStream", { async: false } )

}).reopenClass({
	toString() { return "kraken/search/streams"; }
});
