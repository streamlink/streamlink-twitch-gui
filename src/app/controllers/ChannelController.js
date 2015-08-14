define( [ "Ember" ], function( Ember ) {

	var get = Ember.get;
	var alias = Ember.computed.alias;
	var equal = Ember.computed.equal;

	return Ember.Controller.extend({
		application: Ember.inject.controller(),

		stream : alias( "model.stream" ),
		channel: alias( "model.channel" ),

		isSubrouteSettings: equal( "application.currentRouteName", "channel.settings" ),

		actions: {
			"toggleSettings": function() {
				this.transitionToRoute(
					get( this, "isSubrouteSettings" )
						? "channel.index"
						: "channel.settings",
					get( this, "model.channel.id" )
				);
			}
		}
	});

});
