define([
	"Ember",
	"components/button/FormButtonComponent",
	"mixins/FollowButtonMixin"
], function(
	Ember,
	FormButtonComponent,
	FollowButtonMixin
) {

	var alias = Ember.computed.alias;


	return FormButtonComponent.extend( FollowButtonMixin, {
		modelName: "twitchUserFollowsGame",

		// model alias (component attribute)
		model    : alias( "game" ),
		// model is a string, no game record (just use the game name as ID)
		id       : alias( "model" )
	});

});
