import EmberRouter from "@ember/routing/router";


export default EmberRouter.extend().map(function() {
	this.route( "watching" );
	this.route( "search" );
	this.route( "featured" );
	this.route( "games", function() {
		this.route( "game", { path: "/:game" } );
	});
	this.route( "streams" );
	this.route( "channel", { path: "/channel/:channel" }, function() {
		this.route( "teams" );
		this.route( "settings" );
	});
	this.route( "user", function() {
		this.route( "auth" );
		this.route( "followedStreams" );
		this.route( "followedChannels" );
		this.route( "followedGames", function() {
			this.route( "all" );
		});
	});
	this.route( "team", { path: "/team/:team" }, function() {
		this.route( "members" );
		this.route( "info" );
	});
	this.route( "settings", function() {
		this.route( "main" );
		this.route( "streams" );
		this.route( "streaming" );
		this.route( "player" );
		this.route( "chat" );
		this.route( "gui" );
		this.route( "lists" );
		this.route( "languages" );
		this.route( "notifications" );
		this.route( "channels" );
	});
	this.route( "about" );
});
