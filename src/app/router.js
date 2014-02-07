define( [ "ember" ], function( Ember ) {
	var Router = Ember.Router.extend();

	Router.map(function() {

		this.route( "index", { path: "/" } );

		this.resource( "games", function() {
			this.route( "game", { path: "/:game" } );
		});

		this.resource( "channels", function() {
			this.route( "channel", { path: "/:channel" } );
		});

		this.resource( "videos", function() {
			this.route( "video", { path: "/:video" } );
		});

		this.route( "following" );

		this.route( "subscriptions" );

		this.route( "settings" );

		this.route( "help" );

	});

	return Router;
});
