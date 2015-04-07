define( [ "ember" ], function( Ember ) {

	var Router = Ember.Router.extend();

	Router.map(function() {

		this.route( "index", { path: "/" } );

		this.route( "watching" );

		this.route( "search", { path: "/search/:filter/:query" } );

		this.route( "featured" );

		this.resource( "games", function() {
			this.route( "game", { path: "/:game" } );
		});

		this.resource( "channels", function() {
			this.resource( "channels.channel", { path: "/:channel" }, function() {
				this.route( "settings" );
			});
		});

		this.resource( "videos", function() {
			this.route( "video", { path: "/:video" } );
		});

		this.resource( "user", function() {
			this.route( "auth" );
			this.route( "following" );
			this.route( "subscriptions" );
		});

		this.route( "history" );

		this.route( "mostviewed" );

		this.route( "settings" );

		this.route( "about" );

	});

	return Router;

});
