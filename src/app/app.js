define(function( require ) {

	var Ember = require( "Ember" );
	var DS    = require( "EmberData" );

	require( "initializers/initializers" );


	return Ember.Application.create({

		// Configuration
		rootElement: document.documentElement,


		// Routing
		Router: require( "router" ),


		// Store
		ApplicationAdapter: require( "store/TwitchAdapter" ),


		// Models: memory
		Livestreamer: require( "models/Livestreamer" ),
		LivestreamerAdapter: DS.Adapter,


		// Models: localstorage
		Window: require( "models/localstorage/Window" ),
		WindowAdapter: DS.LSAdapter.extend({ namespace: "window" }),
		WindowSerializer: DS.LSSerializer,
		Settings: require( "models/localstorage/Settings" ),
		SettingsAdapter: DS.LSAdapter.extend({ namespace: "settings" }),
		SettingsSerializer: DS.LSSerializer,
		Versioncheck: require( "models/localstorage/Versioncheck" ),
		VersioncheckAdapter: DS.LSAdapter.extend({ namespace: "versioncheck" }),
		VersioncheckSerializer: DS.LSSerializer,
		Auth: require( "models/localstorage/Auth" ),
		AuthAdapter: DS.LSAdapter.extend({ namespace: "auth" }),
		AuthSerializer: DS.LSSerializer,
		Search: require( "models/localstorage/Search" ),
		SearchAdapter: DS.LSAdapter.extend({ namespace: "search" }),
		SearchSerializer: DS.LSSerializer,
		ChannelSettings: require( "models/localstorage/ChannelSettings" ),
		ChannelSettingsAdapter: DS.LSAdapter.extend({ namespace: "channelsettings" }),
		ChannelSettingsSerializer: DS.LSSerializer,


		// Models: github
		GithubReleases: require( "models/github/Releases" ),
		GithubReleasesAdapter: require( "store/GithubAdapter" ),
		GithubReleasesSerializer: require( "models/github/ReleasesSerializer" ),


		// Models: twitch
		TwitchToken: require( "models/twitch/Token" ),
		TwitchTokenSerializer: require( "models/twitch/TokenSerializer" ),

		TwitchGame: require( "models/twitch/Game" ),
		TwitchGameSerializer: require( "models/twitch/GameSerializer" ),
		TwitchStream: require( "models/twitch/Stream" ),
		TwitchStreamSerializer: require( "models/twitch/StreamSerializer" ),
		TwitchChannel: require( "models/twitch/Channel" ),
		TwitchChannelSerializer: require( "models/twitch/ChannelSerializer" ),
		TwitchTeam: require( "models/twitch/Team" ),
		TwitchTeamSerializer: require( "models/twitch/TeamSerializer" ),
		TwitchImage: require( "models/twitch/Image" ),
		TwitchImageSerializer: require( "models/twitch/ImageSerializer" ),

		TwitchGamesTop: require( "models/twitch/GamesTop" ),
		TwitchGamesTopSerializer: require( "models/twitch/GamesTopSerializer" ),
		TwitchStreamsSummary: require( "models/twitch/StreamsSummary" ),
		TwitchStreamsSummarySerializer: require( "models/twitch/StreamsSummarySerializer" ),
		TwitchStreamsFeatured: require( "models/twitch/StreamsFeatured" ),
		TwitchStreamsFeaturedSerializer: require( "models/twitch/StreamsFeaturedSerializer" ),

		TwitchStreamsFollowed: require( "models/twitch/StreamsFollowed" ),
		TwitchStreamsFollowedSerializer: require( "models/twitch/StreamsFollowedSerializer" ),
		TwitchChannelsFollowed: require( "models/twitch/ChannelsFollowed" ),
		TwitchChannelsFollowedSerializer: require( "models/twitch/ChannelsFollowedSerializer" ),
		TwitchGamesFollowed: require( "models/twitch/GamesFollowed" ),
		TwitchGamesFollowedSerializer: require( "models/twitch/GamesFollowedSerializer" ),

		TwitchSearchGame: require( "models/twitch/SearchGame" ),
		TwitchSearchGameSerializer: require( "models/twitch/SearchGameSerializer" ),
		TwitchSearchStream: require( "models/twitch/SearchStream" ),
		TwitchSearchStreamSerializer: require( "models/twitch/SearchStreamSerializer" ),
		TwitchSearchChannel: require( "models/twitch/SearchChannel" ),
		TwitchSearchChannelSerializer: require( "models/twitch/SearchChannelSerializer" ),

		TwitchUserFollowsChannel: require( "models/twitch/UserFollowsChannel" ),
		TwitchUserFollowsChannelSerializer: require( "models/twitch/UserFollowsChannelSerializer" ),
		TwitchUserFollowsGame: require( "models/twitch/UserFollowsGame" ),
		TwitchUserFollowsGameSerializer: require( "models/twitch/UserFollowsGameSerializer" ),
		TwitchUserSubscription: require( "models/twitch/UserSubscription" ),
		TwitchUserSubscriptionSerializer: require( "models/twitch/UserSubscriptionSerializer" ),

		TwitchTicket: require( "models/twitch/Ticket" ),
		TwitchTicketSerializer: require( "models/twitch/TicketSerializer" ),
		TwitchProduct: require( "models/twitch/Product" ),
		TwitchProductSerializer: require( "models/twitch/ProductSerializer" ),
		TwitchProductEmoticon: require( "models/twitch/ProductEmoticon" ),
		TwitchProductEmoticonSerializer: require( "models/twitch/ProductEmoticonSerializer" ),


		// Ember additions/changes/fixes
		BooleanTransform: require( "store/BooleanTransform" ),
		LinkComponent: require( "components/LinkComponent" ),


		// Helpers
		IsEqualHelper: require( "helpers/IsEqualHelper" ),
		IsNullHelper: require( "helpers/IsNullHelper" ),
		IsGtHelper: require( "helpers/IsGtHelper" ),
		IsGteHelper: require( "helpers/IsGteHelper" ),
		BoolNotHelper: require( "helpers/BoolNotHelper" ),
		BoolAndHelper: require( "helpers/BoolAndHelper" ),
		BoolOrHelper: require( "helpers/BoolOrHelper" ),
		MathAddHelper: require( "helpers/MathAddHelper" ),
		MathSubHelper: require( "helpers/MathSubHelper" ),
		MathMulHelper: require( "helpers/MathMulHelper" ),
		MathDivHelper: require( "helpers/MathDivHelper" ),
		FormatViewersHelper: require( "helpers/FormatViewersHelper" ),
		FormatTimeHelper: require( "helpers/FormatTimeHelper" ),
		HoursFromNowHelper: require( "helpers/HoursFromNowHelper" ),
		TimeFromNowHelper: require( "helpers/TimeFromNowHelper" ),
		GetParamHelper: require( "helpers/GetParamHelper" ),
		GetPathHelper: require( "helpers/GetPathHelper" ),


		// Services
		MetadataService: require( "services/MetadataService" ),
		SettingsService: require( "services/SettingsService" ),
		AuthService: require( "services/AuthService" ),
		NotificationService: require( "services/NotificationService" ),
		ChatService: require( "services/ChatService" ),


		// Application
		ApplicationRoute: require( "routes/ApplicationRoute" ),
		ApplicationController: require( "controllers/ApplicationController" ),
		ApplicationView: require( "components/ApplicationComponent" ),
		ApplicationTemplate: require( "hbs!templates/application.html" ),

		LoadingRoute: require( "routes/LoadingRoute" ),
		LoadingTemplate: require( "hbs!templates/loading.html" ),

		ErrorRoute: require( "routes/ErrorRoute" ),
		ErrorTemplate: require( "hbs!templates/error.html" ),

		IndexRoute: require( "routes/IndexRoute" ),

		VersioncheckController: require( "controllers/VersioncheckController" ),
		LivestreamerController: require( "controllers/LivestreamerController" ),


		// Modal Dialogs
		ModalDialogComponent: require( "components/ModalDialogComponent" ),
		ModalHeaderComponent: require( "components/ModalHeaderComponent" ),
		ModalBodyComponent: require( "components/ModalBodyComponent" ),
		ModalFooterComponent: require( "components/ModalFooterComponent" ),

		VersioncheckModalTemplate: require( "hbs!templates/modals/versioncheck.html" ),
		SettingsModalTemplate: require( "hbs!templates/modals/settings.html" ),
		LivestreamerModalTemplate: require( "hbs!templates/modals/livestreamer.html" ),
		QuitModalTemplate: require( "hbs!templates/modals/quit.html" ),


		// Components
		FormButtonComponent: require( "components/FormButtonComponent" ),
		SearchBarComponent: require( "components/SearchBarComponent" ),
		QuickBarComponent: require( "components/QuickBarComponent" ),
		QuickBarHomepageComponent: require( "components/QuickBarHomepageComponent" ),
		QuickBarRandomStreamComponent: require( "components/QuickBarRandomStreamComponent" ),
		ExternalLinkComponent: require( "components/ExternalLinkComponent" ),
		LivestreamerDocsComponent: require( "components/LivestreamerDocsComponent" ),
		CheckBoxComponent: require( "components/CheckBoxComponent" ),
		RadioButtonComponent: require( "components/RadioButtonComponent" ),
		RadioButtonsComponent: require( "components/RadioButtonsComponent" ),
		FileSelectComponent: require( "components/FileSelectComponent" ),
		GameItemComponent: require( "components/GameItemComponent" ),
		StreamItemComponent: require( "components/StreamItemComponent" ),
		ChannelItemComponent: require( "components/ChannelItemComponent" ),
		SubscriptionItemComponent: require( "components/SubscriptionItemComponent" ),
		InfiniteScrollComponent: require( "components/InfiniteScrollComponent" ),
		EmbeddedLinksComponent: require( "components/EmbeddedLinksComponent" ),
		FlagIconComponent: require( "components/FlagIconComponent" ),
		StatsRowComponent: require( "components/StatsRowComponent" ),
		LangFilterComponent: require( "components/LangFilterComponent" ),
		PreviewImageComponent: require( "components/PreviewImageComponent" ),
		OpenChatComponent: require( "components/OpenChatComponent" ),
		ShareChannelComponent: require( "components/ShareChannelComponent" ),
		SubscribeChannelComponent: require( "components/SubscribeChannelComponent" ),
		FollowChannelComponent: require( "components/FollowChannelComponent" ),
		FollowGameComponent: require( "components/FollowGameComponent" ),
		WrapContentComponent: require( "components/WrapContentComponent" ),
		DropDownComponent: require( "components/DropDownComponent" ),
		ModalLogComponent: require( "components/ModalLogComponent" ),
		LoadingSpinnerComponent: require( "components/LoadingSpinnerComponent" ),


		// Content
		FeaturedRoute: require( "routes/FeaturedRoute" ),
		FeaturedController: require( "controllers/FeaturedController" ),
		FeaturedTemplate: require( "hbs!templates/featured.html" ),

		WatchingRoute: require( "routes/WatchingRoute" ),
		WatchingController: require( "controllers/WatchingController" ),
		WatchingTemplate: require( "hbs!templates/watching.html" ),

		SearchRoute: require( "routes/SearchRoute" ),
		SearchController: require( "controllers/SearchController" ),
		SearchTemplate: require( "hbs!templates/search.html" ),

		GamesLoadingRoute: require( "routes/LoadingRoute" ),
		GamesLoadingTemplate: require( "hbs!templates/loading.html" ),
		GamesIndexRoute: require( "routes/GamesIndexRoute" ),
		GamesIndexController: require( "controllers/GamesIndexController" ),
		GamesIndexTemplate: require( "hbs!templates/games/index.html" ),
		GamesGameRoute: require( "routes/GamesGameRoute" ),
		GamesGameController: require( "controllers/GamesGameController" ),
		GamesGameTemplate: require( "hbs!templates/games/game.html" ),

		ChannelsRoute: require( "routes/ChannelsRoute" ),
		ChannelsController: require( "controllers/ChannelsController" ),
		ChannelsTemplate: require( "hbs!templates/channels.html" ),

		ChannelRoute: require( "routes/ChannelRoute" ),
		ChannelController: require( "controllers/ChannelController" ),
		ChannelTemplate: require( "hbs!templates/channel/channel.html" ),
		ChannelLoadingRoute: require( "routes/LoadingRoute" ),
		ChannelLoadingTemplate: require( "hbs!templates/loading.html" ),
		ChannelIndexRoute: require( "routes/ChannelIndexRoute" ),
		ChannelIndexController: require( "controllers/ChannelIndexController" ),
		ChannelIndexTemplate: require( "hbs!templates/channel/index.html" ),
		ChannelSettingsRoute: require( "routes/ChannelSettingsRoute" ),
		ChannelSettingsController: require( "controllers/ChannelSettingsController" ),
		ChannelSettingsTemplate: require( "hbs!templates/channel/settings.html" ),

		UserLoadingRoute: require( "routes/LoadingRoute" ),
		UserLoadingTemplate: require( "hbs!templates/loading.html" ),
		UserIndexRoute: require( "routes/UserIndexRoute" ),
		UserIndexController: require( "controllers/UserIndexController" ),
		UserIndexTemplate: require( "hbs!templates/user/index.html" ),
		UserAuthRoute: require( "routes/UserAuthRoute" ),
		UserAuthController: require( "controllers/UserAuthController" ),
		UserAuthTemplate: require( "hbs!templates/user/auth.html" ),
		UserSubscriptionsRoute: require( "routes/UserSubscriptionsRoute" ),
		UserSubscriptionsTemplate: require( "hbs!templates/user/subscriptions.html" ),
		UserFollowedStreamsRoute: require( "routes/UserFollowedStreamsRoute" ),
		UserFollowedStreamsTemplate: require( "hbs!templates/user/followedstreams.html" ),
		UserFollowedChannelsRoute: require( "routes/UserFollowedChannelsRoute" ),
		UserFollowedChannelsController: require( "controllers/UserFollowedChannelsController" ),
		UserFollowedChannelsTemplate: require( "hbs!templates/user/followedchannels.html" ),
		UserFollowedGamesRoute: require( "routes/UserFollowedGamesRoute" ),
		UserFollowedGamesTemplate: require( "hbs!templates/user/followedgames.html" ),

		SettingsRoute: require( "routes/SettingsRoute" ),
		SettingsController: require( "controllers/SettingsController" ),
		SettingsTemplate: require( "hbs!templates/settings.html" ),

		AboutController: require( "controllers/AboutController" ),
		AboutTemplate: require( "hbs!templates/about.html" ),


		// ready event
		ready: function ready() {
			var nwWindow = require( "nwjs/nwWindow" );

			// wait for the SettingsService to load
			var settings = this.__container__.lookup( "service:settings" );
			settings.addObserver( "content", function() {
				if ( !settings.get( "content" ) ) { return; }
				nwWindow.emit( "ready", settings );
			});
		},

		toString: function() { return "App"; }

	});

});
