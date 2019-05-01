import Controller from "@ember/controller";
import { alias } from "@ember/object/computed";
import "./styles.less";


export default class ChannelController extends Controller {
	@alias( "model.stream" )
	stream;
	@alias( "model.channel" )
	channel;
}
