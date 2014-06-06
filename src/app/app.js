define(function( require ) {

	require( [ "ember", "ember-data", "utils/helpers" ], function( Ember, DS ) {

		Ember.Application.create({
			rootElement: document.documentElement,

			Store: DS.Store.extend(),

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

			Searchbar: require( "models/Searchbar" ),
			SearchbarAdapter: require( "store/LocalstorageAdapter" ),
			SearchbarController: require( "controllers/SearchbarController" ),
			SearchbarView: require( "views/SearchbarView" ),

			IndexRoute: require( "routes/IndexRoute" ),
			IndexController: require( "controllers/IndexController" ),
			IndexView: require( "views/IndexView" ),

			SearchRoute: require( "routes/SearchRoute" ),
			SearchController: require( "controllers/SearchController" ),
			SearchView: require( "views/SearchView" ),
			SearchLoadingRoute: require( "routes/LoadingRoute" ),
			SearchLoadingView: require( "views/LoadingView" ),

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
			SettingsAdapter: require( "store/LocalstorageAdapter" ),
			SettingsRoute: require( "routes/SettingsRoute" ),
			SettingsController: require( "controllers/SettingsController" ),
			SettingsView: require( "views/SettingsView" ),

			AboutController: require( "controllers/AboutController" ),
			AboutView: require( "views/AboutView" ),

			RadioButtonComponent: require( "components/RadioButtonComponent" ),
			RadioButtonsComponent: require( "components/RadioButtonsComponent" ),
			GameItemComponent: require( "components/GameItemComponent" ),
			StreamItemComponent: require( "components/StreamItemComponent" ),
			InfiniteScrollComponent: require( "components/InfiniteScrollComponent" ),

			LivestreamerController: require( "controllers/LivestreamerController" ),

			Versioncheck: require( "models/Versioncheck" ),
			VersioncheckAdapter: require( "store/LocalstorageAdapter" ),
			VersioncheckController: require( "controllers/VersioncheckController" ),
			GithubReleases: require( "models/github/Releases" ),
			GithubReleasesAdapter: require( "store/GithubAdapter" )
		});

	});

});
