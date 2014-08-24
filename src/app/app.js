define(function( require ) {

	require([
		"ember",
		"ember-data",
		"utils/inflector",
		"utils/helpers"
	], function( Ember, DS ) {

		Ember.Application.create({

			// Configuration
			rootElement: document.documentElement,


			// Routing
			Router: require( "Router" ),


			// Store
			ApplicationStore: DS.Store.extend(),
			LocalstorageSerializer: DS.LSSerializer.extend(),


			// Models: localstorage
			Settings: require( "models/Settings" ),
			SettingsAdapter: require( "store/LocalstorageAdapter" ),
			Versioncheck: require( "models/Versioncheck" ),
			VersioncheckAdapter: require( "store/LocalstorageAdapter" ),
			Searchbar: require( "models/Searchbar" ),
			SearchbarAdapter: require( "store/LocalstorageAdapter" ),


			// Models: github
			GithubReleases: require( "models/github/Releases" ),
			GithubReleasesAdapter: require( "store/GithubAdapter" ),


			// Application
			ApplicationRoute: require( "routes/ApplicationRoute" ),
			ApplicationController: require( "controllers/ApplicationController" ),
			ApplicationView: require( "views/ApplicationView" ),

			LoadingRoute: require( "routes/LoadingRoute" ),
			LoadingView: require( "views/LoadingView" ),

			ErrorRoute: require( "routes/ErrorRoute" ),
			ErrorView: require( "views/ErrorView" ),

			ModalController: require( "controllers/ModalController" ),
			ModalView: require( "views/ModalView" ),

			SearchbarController: require( "controllers/SearchbarController" ),
			SearchbarView: require( "views/SearchbarView" ),

			VersioncheckController: require( "controllers/VersioncheckController" ),
			LivestreamerController: require( "controllers/LivestreamerController" ),


			// Components
			ExternalLinkComponent: require( "components/ExternalLinkComponent" ),
			LivestreamerDocsComponent: require( "components/LivestreamerDocsComponent" ),
			RadioButtonComponent: require( "components/RadioButtonComponent" ),
			RadioButtonsComponent: require( "components/RadioButtonsComponent" ),
			GameItemComponent: require( "components/GameItemComponent" ),
			StreamItemComponent: require( "components/StreamItemComponent" ),
			InfiniteScrollComponent: require( "components/InfiniteScrollComponent" ),


			// Content
			WatchingRoute: require( "routes/WatchingRoute" ),
			WatchingController: require( "controllers/WatchingController" ),
			WatchingView: require( "views/WatchingView" ),

			IndexRoute: require( "routes/IndexRoute" ),
			IndexController: require( "controllers/IndexController" ),
			IndexView: require( "views/IndexView" ),

			SearchRoute: require( "routes/SearchRoute" ),
			SearchController: require( "controllers/SearchController" ),
			SearchView: require( "views/SearchView" ),

			GamesLoadingRoute: require( "routes/LoadingRoute" ),
			GamesLoadingView: require( "views/LoadingView" ),
			GamesIndexRoute: require( "routes/GamesIndexRoute" ),
			GamesIndexController: require( "controllers/GamesIndexController" ),
			GamesIndexView: require( "views/GamesIndexView" ),
			GamesGameRoute: require( "routes/GamesGameRoute" ),
			GamesGameController: require( "controllers/GamesGameController" ),
			GamesGameView: require( "views/GamesGameView" ),

			ChannelsLoadingRoute: require( "routes/LoadingRoute" ),
			ChannelsLoadingView: require( "views/LoadingView" ),
			ChannelsIndexRoute: require( "routes/ChannelsIndexRoute" ),
			ChannelsIndexController: require( "controllers/ChannelsIndexController" ),
			ChannelsIndexView: require( "views/ChannelsIndexView" ),

			SettingsRoute: require( "routes/SettingsRoute" ),
			SettingsController: require( "controllers/SettingsController" ),
			SettingsView: require( "views/SettingsView" ),

			AboutController: require( "controllers/AboutController" ),
			AboutView: require( "views/AboutView" )
		});

	});

});
