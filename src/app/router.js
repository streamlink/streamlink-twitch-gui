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

	this.route( "channels" );

	this.route( "channel", { path: "/channel/:channel" }, function() {
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

	this.route( "settings", function() {
		this.route( "main" );
		this.route( "streams" );
		this.route( "livestreamer" );
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
