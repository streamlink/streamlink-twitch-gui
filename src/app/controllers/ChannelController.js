define( [ "Ember" ], function( Ember ) {

	var get = Ember.get;
	var alias = Ember.computed.alias;
	var equal = Ember.computed.equal;

	return Ember.Controller.extend({
		needs: [ "application" ],

		stream : alias( "model.stream" ),
		channel: alias( "model.channel" ),

		isSubrouteSettings: equal( "controllers.application.currentRouteName", "channel.settings" ),

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
