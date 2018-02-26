import { get, set } from "@ember/object";
import { on } from "@ember/object/evented";
import Router from "@ember/routing/router";


const ApplicationRouter = Router.extend();


ApplicationRouter.map(function() {

	this.route( "watching" );

	this.route( "search" );

	this.route( "featured" );

	this.route( "games", function() {
		this.route( "game", { path: "/:game" } );
	});

	this.route( "communities", function() {
		this.route( "index", { path: "/" }, function() {
			this.route( "all" );
		});
		this.route( "community", { path: "/community/:community_id" }, function() {
			this.route( "info" );
		});
	});

	this.route( "streams" );

	this.route( "channel", { path: "/channel/:channel" }, function() {
		this.route( "teams" );
		this.route( "settings" );
	});

	this.route( "user", function() {
		this.route( "auth" );
		this.route( "subscriptions" );
		this.route( "followedStreams" );
		this.route( "hostedStreams" );
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


ApplicationRouter.reopen({
	lastRouteName: "index",

	_updateLastRouteName: on( "willTransition", function() {
		const routeName = get( this, "currentRouteName" );
		if ( routeName && routeName !== "loading" && routeName !== "error" ) {
			set( this, "lastRouteName", routeName );
		}
	})
});


export default ApplicationRouter;
