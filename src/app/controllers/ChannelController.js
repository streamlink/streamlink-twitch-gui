define( [ "Ember" ], function( Ember ) {

	var get = Ember.get;

	return Ember.Controller.extend({
		needs: [ "application" ],

		stream : Ember.computed.alias( "model.stream" ),
		channel: Ember.computed.alias( "model.channel" ),

		isSubrouteSettings: function() {
			var currentRouteName = get( this, "controllers.application.currentRouteName" );
			return currentRouteName === "channel.settings";
		}.property( "controllers.application.currentRouteName" ),

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
