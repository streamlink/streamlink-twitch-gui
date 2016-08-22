import Ember from "Ember";
import FormButtonComponent from "components/button/FormButtonComponent";
import FollowButtonMixin from "mixins/FollowButtonMixin";


	var alias = Ember.computed.alias;


	export default FormButtonComponent.extend( FollowButtonMixin, {
		modelName: "twitchUserFollowsGame",

		// model alias (component attribute)
		model    : alias( "game" ),
		// model is a string, no game record (just use the game name as ID)
		id       : alias( "model" )
	});
