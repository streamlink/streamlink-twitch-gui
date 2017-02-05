import { computed } from "Ember";
import FollowButtonComponent from "components/button/FollowButtonComponent";


const { alias } = computed;


export default FollowButtonComponent.extend({
	modelName: "twitchUserFollowsChannel",

	// model alias (component attribute)
	model    : alias( "channel" ),
	// save the data on the channel record instead of the component
	record   : alias( "channel.followed" ),
	// use the channel's display_name
	name     : alias( "channel.display_name" )
});
