import {
	belongsTo,
	Model
} from "EmberData";


export default Model.extend({
	stream: belongsTo( "twitchStream", { async: false } )

}).reopenClass({
	toString: function() { return "kraken/streams/followed"; }
});
