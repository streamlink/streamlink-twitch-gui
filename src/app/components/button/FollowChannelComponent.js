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
		modelName: "twitchUserFollowsChannel",

		// model alias (component attribute)
		model    : alias( "channel" ),
		// save the data on the channel record instead of the component
		record   : alias( "channel.followed" ),
		// use the channel's display_name
		name     : alias( "channel.display_name" )
	});

});
