import Controller from "@ember/controller";
import { alias } from "@ember/object/computed";


export default Controller.extend({
	stream : alias( "model.stream" ),
	channel: alias( "model.channel" )
});
