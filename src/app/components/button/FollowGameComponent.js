import { alias } from "@ember/object/computed";
import FollowButtonComponent from "./FollowButtonComponent";


export default FollowButtonComponent.extend({
	modelName: "twitchGameFollowed",

	// model alias (component attribute)
	model    : alias( "game" ),
	// model is a string, no game record (just use the game name as ID)
	id       : alias( "model" )
});
