define(function( require ) {

	var Ember = require( "Ember" );
	var DS    = require( "EmberData" );

	require( "initializers/initializers" );


	return Ember.Application.create({

		// Configuration
		rootElement: document.documentElement,


		// Resolver
		Resolver: require( "resolver" ),


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


		// Application
		ApplicationRoute: require( "routes/ApplicationRoute" ),
		ApplicationController: require( "controllers/ApplicationController" ),
		ApplicationView: require( "views/ApplicationView" ),

		LoadingRoute: require( "routes/LoadingRoute" ),
		LoadingTemplate: require( "text!templates/loading.html.hbs" ),

		ErrorRoute: require( "routes/ErrorRoute" ),
		ErrorTemplate: require( "text!templates/error.html.hbs" ),

		IndexRoute: require( "routes/IndexRoute" ),

		ModalView: require( "views/ModalView" ),

		QuitModalTemplate: require( "text!templates/modals/quit.html.hbs" ),

		VersioncheckController: require( "controllers/VersioncheckController" ),
		VersioncheckModalTemplate: require( "text!templates/modals/versioncheck.html.hbs" ),

		LivestreamerController: require( "controllers/LivestreamerController" ),
		LivestreamerModalView: require( "views/LivestreamerModalView" ),
		LivestreamerModalTemplate: require( "text!templates/modals/livestreamer.html.hbs" ),


		// Components
		FormButtonComponent: require( "components/FormButtonComponent" ),
		SearchBarComponent: require( "components/SearchBarComponent" ),
		SettingsBarComponent: require( "components/SettingsBarComponent" ),
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


		// Content
		FeaturedRoute: require( "routes/FeaturedRoute" ),
		FeaturedController: require( "controllers/FeaturedController" ),
		FeaturedTemplate: require( "text!templates/featured.html.hbs" ),

		WatchingRoute: require( "routes/WatchingRoute" ),
		WatchingController: require( "controllers/WatchingController" ),
		WatchingTemplate: require( "text!templates/watching.html.hbs" ),

		SearchRoute: require( "routes/SearchRoute" ),
		SearchController: require( "controllers/SearchController" ),
		SearchTemplate: require( "text!templates/search.html.hbs" ),

		GamesLoadingRoute: require( "routes/LoadingRoute" ),
		GamesLoadingTemplate: require( "text!templates/loading.html.hbs" ),
		GamesIndexRoute: require( "routes/GamesIndexRoute" ),
		GamesIndexController: require( "controllers/GamesIndexController" ),
		GamesIndexTemplate: require( "text!templates/games/index.html.hbs" ),
		GamesGameRoute: require( "routes/GamesGameRoute" ),
		GamesGameController: require( "controllers/GamesGameController" ),
		GamesGameTemplate: require( "text!templates/games/game.html.hbs" ),

		ChannelsRoute: require( "routes/ChannelsRoute" ),
		ChannelsController: require( "controllers/ChannelsController" ),
		ChannelsTemplate: require( "text!templates/channels.html.hbs" ),

		ChannelRoute: require( "routes/ChannelRoute" ),
		ChannelController: require( "controllers/ChannelController" ),
		ChannelTemplate: require( "text!templates/channel/channel.html.hbs" ),
		ChannelLoadingRoute: require( "routes/LoadingRoute" ),
		ChannelLoadingTemplate: require( "text!templates/loading.html.hbs" ),
		ChannelIndexRoute: require( "routes/ChannelIndexRoute" ),
		ChannelIndexController: require( "controllers/ChannelIndexController" ),
		ChannelIndexTemplate: require( "text!templates/channel/index.html.hbs" ),
		ChannelSettingsRoute: require( "routes/ChannelSettingsRoute" ),
		ChannelSettingsController: require( "controllers/ChannelSettingsController" ),
		ChannelSettingsTemplate: require( "text!templates/channel/settings.html.hbs" ),

		UserLoadingRoute: require( "routes/LoadingRoute" ),
		UserLoadingTemplate: require( "text!templates/loading.html.hbs" ),
		UserIndexRoute: require( "routes/UserIndexRoute" ),
		UserIndexController: require( "controllers/UserIndexController" ),
		UserIndexTemplate: require( "text!templates/user/index.html.hbs" ),
		UserAuthRoute: require( "routes/UserAuthRoute" ),
		UserAuthController: require( "controllers/UserAuthController" ),
		UserAuthTemplate: require( "text!templates/user/auth.html.hbs" ),
		UserSubscriptionsRoute: require( "routes/UserSubscriptionsRoute" ),
		UserSubscriptionsTemplate: require( "text!templates/user/subscriptions.html.hbs" ),
		UserFollowedStreamsRoute: require( "routes/UserFollowedStreamsRoute" ),
		UserFollowedStreamsTemplate: require( "text!templates/user/followedstreams.html.hbs" ),
		UserFollowedChannelsRoute: require( "routes/UserFollowedChannelsRoute" ),
		UserFollowedChannelsController: require( "controllers/UserFollowedChannelsController" ),
		UserFollowedChannelsTemplate: require( "text!templates/user/followedchannels.html.hbs" ),
		UserFollowedGamesRoute: require( "routes/UserFollowedGamesRoute" ),
		UserFollowedGamesTemplate: require( "text!templates/user/followedgames.html.hbs" ),

		SettingsRoute: require( "routes/SettingsRoute" ),
		SettingsController: require( "controllers/SettingsController" ),
		SettingsTemplate: require( "text!templates/settings.html.hbs" ),
		SettingsModalTemplate: require( "text!templates/modals/settings.html.hbs" ),

		AboutController: require( "controllers/AboutController" ),
		AboutTemplate: require( "text!templates/about.html.hbs" ),


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
