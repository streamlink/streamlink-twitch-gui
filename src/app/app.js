define(function( require ) {

	require( [ "ember", "ember-data" ], function( Ember, DS ) {

		Ember.Application.create({
			rootElement: document.documentElement,

			Store: DS.Store.extend({
				adapter: DS.LSAdapter.extend({
					namespace: "app"
				})
			}),


			Router: require( "Router" ),


			ApplicationRoute: require( "routes/ApplicationRoute" ),
			ApplicationController: require( "controllers/ApplicationController" ),
			ApplicationView: require( "views/ApplicationView" ),

			LoadingRoute: require( "routes/LoadingRoute" ),
			LoadingView: require( "views/LoadingView" ),

			ErrorRoute: require( "routes/ErrorRoute" ),
			ErrorView: require( "views/ErrorView" ),

			ModalController: require( "controllers/ModalController" ),
			ModalView: require( "views/ModalView" ),

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
			SettingsRoute: require( "routes/SettingsRoute" ),
			SettingsController: require( "controllers/SettingsController" ),
			SettingsView: require( "views/SettingsView" ),

			AboutController: require( "controllers/AboutController" ),
			AboutView: require( "views/AboutView" ),

			StreamItemComponent: require( "components/StreamItemComponent" ),

			LivestreamerController: require( "controllers/LivestreamerController" )
		});

		require( [ "utils/helpers" ] );
	});

});
