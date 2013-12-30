define(function( require ) {

	require( [ "ember", "ember-data" ], function( Ember, DS ) {

		Ember.Application.create({
			rootElement: document.documentElement,

			Store: DS.Store.extend({
				adapter: DS.LSAdapter.extend({
					namespace: "app"
				})
			}),


			Router: require( "router" ),


			ApplicationRoute: require( "routes/ApplicationRoute" ),
			ApplicationController: require( "controllers/ApplicationController" ),
			ApplicationView: require( "views/ApplicationView" ),

			LoadingRoute: require( "routes/LoadingRoute" ),
			LoadingView: require( "views/LoadingView" ),

			IndexRoute: require( "routes/IndexRoute" ),
			IndexView: require( "views/IndexView" ),

			GamesIndexRoute: require( "routes/GamesIndexRoute" ),
			GamesIndexController: require( "controllers/GamesIndexController" ),
			GamesIndexView: require( "views/GamesIndexView" ),
			GamesLoadingRoute: require( "routes/LoadingRoute" ),
			GamesLoadingView: require( "views/LoadingView" ),

			GamesGameRoute: require( "routes/GamesGameRoute" ),
			GamesGameController: require( "controllers/GamesGameController" ),
			GamesGameView: require( "views/GamesGameView" ),

			ChannelsIndexController: require( "controllers/ChannelsIndexController" ),
			ChannelsIndexRoute: require( "routes/ChannelsIndexRoute" ),
			ChannelsIndexView: require( "views/ChannelsIndexView" ),
			ChannelsLoadingRoute: require( "routes/LoadingRoute" ),
			ChannelsLoadingView: require( "views/LoadingView" ),

			Settings: require( "models/Settings" ),
			SettingsIndexController: require( "controllers/SettingsController" ),
			SettingsIndexRoute: require( "routes/SettingsRoute" ),
			SettingsIndexView: require( "views/SettingsView" ),

			StreamItemComponent: require( "components/StreamItemComponent" )
		});

		require( [ "utils/helpers" ] );
	});

});
