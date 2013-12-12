define(function( require ) {

	var App = {
		/*
		debugMode: true,
		LOG_TRANSITIONS: true,
		LOG_BINDINGS: true,
		LOG_VIEW_LOOKUPS: true,
		LOG_STACKTRACE_ON_DEPRECATION: true,
		LOG_VERSION: true,
		*/

		//rootElement: document.documentElement,


		Router: require( "router/router" ),


		ApplicationController: require( "controllers/ApplicationController" ),
		ApplicationView: require( "views/ApplicationView" ),
		LoadingView: require( "views/LoadingView" ),

		IndexRoute: require( "routes/IndexRoute" ),
		IndexView: require( "views/IndexView" ),

		GamesIndexRoute: require( "routes/GamesIndexRoute" ),
		GamesIndexController: require( "controllers/GamesIndexController" ),
		GamesIndexView: require( "views/GamesIndexView" ),

		GamesGameRoute: require( "routes/GamesGameRoute" ),
		GamesGameController: require( "controllers/GamesGameController" ),
		GamesGameView: require( "views/GamesGameView" ),

		ChannelsIndexController: require( "controllers/ChannelsIndexController" ),
		ChannelsIndexRoute: require( "routes/ChannelsIndexRoute" ),
		ChannelsIndexView: require( "views/ChannelsIndexView" )
	};


	require( [ "ember" ], function( Ember ) {
		Ember.Application.create( App );
	});

});
