import Controller from "@ember/controller";
import { alias } from "@ember/object/computed";
import "./styles.less";


export default Controller.extend({
	/** @type {TwitchStream} */
	stream : alias( "model.stream" ),
	/** @type {TwitchUser} */
	user : alias( "model.user" ),
	/** @type {TwitchChannel} */
	channel: alias( "model.channel" )
});
