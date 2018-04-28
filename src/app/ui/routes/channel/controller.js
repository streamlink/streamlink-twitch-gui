import Controller from "@ember/controller";
import { alias } from "@ember/object/computed";
import "./styles.less";


export default Controller.extend({
	stream : alias( "model.stream" ),
	channel: alias( "model.channel" )
});
