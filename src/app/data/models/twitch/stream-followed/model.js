import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";


export default Model.extend( /** @class TwitchStreamFollowed */ {
	/** @type {TwitchStream} */
	stream: belongsTo( "twitch-stream", { async: false } )

}).reopenClass({
	toString() { return "helix/streams/followed"; }
});
