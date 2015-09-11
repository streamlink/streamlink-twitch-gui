define( [ "Ember" ], function( Ember ) {

	var Router = Ember.Router.extend();

	Router.map(function() {

		this.route( "index", { path: "/" } );

		this.route( "watching" );

		this.route( "search", { path: "/search/:filter/:query" } );

		this.route( "featured" );

		this.route( "games", function() {
			this.route( "game", { path: "/:game" } );
		});

		this.route( "channels" );

		this.route( "channel", { path: "/:channel" }, function() {
			this.route( "settings" );
		});

		this.route( "user", function() {
			this.route( "auth" );
			this.route( "subscriptions" );
			this.route( "followedStreams" );
			this.route( "followedChannels" );
			this.route( "followedGames" );
		});

		this.route( "settings" );

		this.route( "about" );

	});

	return Router;

});
