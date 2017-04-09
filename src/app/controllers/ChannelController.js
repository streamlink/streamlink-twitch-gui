import {
	computed,
	Controller
} from "ember";


const { alias } = computed;


export default Controller.extend({
	stream : alias( "model.stream" ),
	channel: alias( "model.channel" )
});
