define( [ "ember" ], function( Ember ) {

	return Ember.ArrayController.extend({
		needs: [ "application" ],

		globalBinding: "controllers.application.model",
		configBinding: "global.package.config",

		sortAscending: false,
		sortProperties: [ "started" ],

		actions: {
			"close": function( stream ) {
				stream && stream.kill && stream.kill();
			},

			"chat": function( stream ) {
				this.send(
					"openBrowser",
					this.get( "config.twitch-chat-url" )
						.replace( "{channel}", Ember.get( stream, "name" ) )
				);
			}
		}
	});

});
