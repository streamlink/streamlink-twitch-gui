import {
	get,
	set,
	on,
	Router
} from "Ember";


const ApplicationRouter = Router.extend();


ApplicationRouter.map(function() {

	this.route( "index", { path: "/" } );

	this.route( "watching" );

	this.route( "search", { path: "/search" } );

	this.route( "featured" );

	this.route( "games", function() {
		this.route( "game", { path: "/:game" } );
	});

	this.route( "communities", function() {
		this.route( "community", { path: "/:community_id" } );
	});

	this.route( "channels" );

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
		this.route( "followedGames" );
	});

	this.route( "team", { path: "/team/:team" }, function() {
		this.route( "index", { path: "/live" } );
		this.route( "members", { path: "/members" } );
	});

	this.route( "settings", function() {
		this.route( "main" );
		this.route( "streams" );
		this.route( "streamprovider" );
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
		var routeName = get( this, "currentRouteName" );
		if ( routeName && routeName !== "loading" && routeName !== "error" ) {
			set( this, "lastRouteName", routeName );
		}
	})
});


export default ApplicationRouter;
