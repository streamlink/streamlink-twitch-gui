define([
	"Ember",
	"EmberData",
	"EmberDataLS",
	"nwjs/nwWindow",
	"initializers/initializers",
	"require"
],function(
	Ember,
	DS,
	LS,
	nwWindow,
	initializers,
	require
) {

	return Ember.Application.create({

		// Configuration
		rootElement: document.documentElement,


		// Routing
		Router: require( "router" ),


		// Store
		ApplicationAdapter: require( "store/TwitchAdapter" ),
		BooleanTransform: require( "store/BooleanTransform" ),


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
		TwitchStreamsHosted: require( "models/twitch/StreamsHosted" ),
		TwitchStreamsHostedSerializer: require( "models/twitch/StreamsHostedSerializer" ),
		TwitchChannelsFollowed: require( "models/twitch/ChannelsFollowed" ),
		TwitchChannelsFollowedSerializer: require( "models/twitch/ChannelsFollowedSerializer" ),
		TwitchGamesFollowed: require( "models/twitch/GamesFollowed" ),
		TwitchGamesFollowedSerializer: require( "models/twitch/GamesFollowedSerializer" ),
		TwitchGamesLiveFollowed: require( "models/twitch/GamesLiveFollowed" ),
		TwitchGamesLiveFollowedSerializer: require( "models/twitch/GamesLiveFollowedSerializer" ),

		TwitchSearchGame: require( "models/twitch/SearchGame" ),
		TwitchSearchGameSerializer: require( "models/twitch/SearchGameSerializer" ),
		TwitchSearchStream: require( "models/twitch/SearchStream" ),
		TwitchSearchStreamSerializer: require( "models/twitch/SearchStreamSerializer" ),
		TwitchSearchChannel: require( "models/twitch/SearchChannel" ),
		TwitchSearchChannelSerializer: require( "models/twitch/SearchChannelSerializer" ),

		TwitchUserFollowsChannel: require( "models/twitch/UserFollowsChannel" ),
		TwitchUserFollowsChannelSerializer: require( "models/twitch/UserFollowsChannelSerializer" ),
		TwitchUserFollowsGame: require( "models/twitch/UserFollowsGame" ),
		TwitchUserFollowsGameAdapter: require( "models/twitch/UserFollowsGameAdapter" ),
		TwitchUserFollowsGameSerializer: require( "models/twitch/UserFollowsGameSerializer" ),
		TwitchUserSubscription: require( "models/twitch/UserSubscription" ),
		TwitchUserSubscriptionSerializer: require( "models/twitch/UserSubscriptionSerializer" ),

		TwitchTicket: require( "models/twitch/Ticket" ),
		TwitchTicketSerializer: require( "models/twitch/TicketSerializer" ),
		TwitchProduct: require( "models/twitch/Product" ),
		TwitchProductSerializer: require( "models/twitch/ProductSerializer" ),
		TwitchProductEmoticon: require( "models/twitch/ProductEmoticon" ),
		TwitchProductEmoticonSerializer: require( "models/twitch/ProductEmoticonSerializer" ),

		TwitchChannelPanel: require( "models/twitch/ChannelPanel" ),
		TwitchChannelPanelSerializer: require( "models/twitch/ChannelPanelSerializer" ),
		TwitchChannelPanelItem: require( "models/twitch/ChannelPanelItem" ),
		TwitchChannelPanelItemSerializer: require( "models/twitch/ChannelPanelItemSerializer" ),


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
		HasOwnPropertyHelper: require( "helpers/HasOwnPropertyHelper" ),


		// Services
		SettingsService: require( "services/SettingsService" ),
		AuthService: require( "services/AuthService" ),
		ModalService: require( "services/ModalService" ),
		VersioncheckService: require( "services/VersioncheckService" ),
		LivestreamerService: require( "services/LivestreamerService" ),
		NotificationService: require( "services/NotificationService" ),
		ChatService: require( "services/ChatService" ),


		// Application
		ApplicationRoute: require( "routes/ApplicationRoute" ),
		ApplicationController: require( "controllers/ApplicationController" ),
		ApplicationView: require( "components/ApplicationComponent" ),
		ApplicationTemplate: require( "templates/Application.hbs" ),

		LoadingRoute: require( "routes/LoadingRoute" ),
		LoadingTemplate: require( "templates/Loading.hbs" ),

		ErrorRoute: require( "routes/ErrorRoute" ),
		ErrorTemplate: require( "templates/Error.hbs" ),

		IndexRoute: require( "routes/IndexRoute" ),


		// Components
		EmbeddedLinksComponent: require( "components/link/EmbeddedLinksComponent" ),
		ExternalLinkComponent: require( "components/link/ExternalLinkComponent" ),
		LinkComponent: require( "components/link/LinkComponent" ),
		DocumentationLinkComponent: require( "components/link/DocumentationLinkComponent" ),

		CheckBoxComponent: require( "components/form/CheckBoxComponent" ),
		RadioBtnComponent: require( "components/form/RadioBtnComponent" ),
		RadioBtnsComponent: require( "components/form/RadioBtnsComponent" ),
		DropDownComponent: require( "components/form/DropDownComponent" ),
		FileSelectComponent: require( "components/form/FileSelectComponent" ),
		TextFieldComponent: require( "components/form/TextFieldComponent" ),

		FollowChannelComponent: require( "components/button/FollowChannelComponent" ),
		FollowGameComponent: require( "components/button/FollowGameComponent" ),
		FormButtonComponent: require( "components/button/FormButtonComponent" ),
		OpenChatComponent: require( "components/button/OpenChatComponent" ),
		ShareChannelComponent: require( "components/button/ShareChannelComponent" ),
		SubscribeChannelComponent: require( "components/button/SubscribeChannelComponent" ),
		TwitchEmotesComponent: require( "components/button/TwitchEmotesComponent" ),

		ModalBodyComponent: require( "components/modal/ModalBodyComponent" ),
		ModalChangelogComponent: require( "components/modal/ModalChangelogComponent" ),
		ModalConfirmComponent: require( "components/modal/ModalConfirmComponent" ),
		ModalFirstrunComponent: require( "components/modal/ModalFirstrunComponent" ),
		ModalFooterComponent: require( "components/modal/ModalFooterComponent" ),
		ModalHeaderComponent: require( "components/modal/ModalHeaderComponent" ),
		ModalLivestreamerComponent: require( "components/modal/ModalLivestreamerComponent" ),
		ModalLogComponent: require( "components/modal/ModalLogComponent" ),
		ModalNewreleaseComponent: require( "components/modal/ModalNewreleaseComponent" ),
		ModalQuitComponent: require( "components/modal/ModalQuitComponent" ),

		ContentListComponent: require( "components/list/ContentListComponent" ),
		ChannelItemComponent: require( "components/list/ChannelItemComponent" ),
		GameItemComponent: require( "components/list/GameItemComponent" ),
		HeadlineTotalsComponent: require( "components/list/HeadlineTotalsComponent" ),
		InfiniteScrollComponent: require( "components/list/InfiniteScrollComponent" ),
		StreamItemComponent: require( "components/list/StreamItemComponent" ),
		SubscriptionItemComponent: require( "components/list/SubscriptionItemComponent" ),

		QuickBarComponent: require( "components/quick/QuickBarComponent" ),
		QuickBarHomepageComponent: require( "components/quick/QuickBarHomepageComponent" ),
		QuickBarRandomStreamComponent: require( "components/quick/QuickBarRandomStreamComponent" ),

		ChannelPanelsComponent: require( "components/channel/ChannelPanelsComponent" ),
		ChannelPanelItemComponent: require( "components/channel/ChannelPanelItemComponent" ),

		StatsRowComponent: require( "components/stream/StatsRowComponent" ),
		StreamPresentationComponent: require( "components/stream/StreamPresentationComponent" ),
		StreamPreviewImageComponent: require( "components/stream/StreamPreviewImageComponent" ),

		FlagIconComponent: require( "components/FlagIconComponent" ),
		LangFilterComponent: require( "components/LangFilterComponent" ),
		LoadingSpinnerComponent: require( "components/LoadingSpinnerComponent" ),
		PreviewImageComponent: require( "components/PreviewImageComponent" ),
		SearchBarComponent: require( "components/SearchBarComponent" ),
		SelectableTextComponent: require( "components/SelectableTextComponent" ),

		SettingsRowComponent: require( "components/SettingsRowComponent" ),
		SettingsChannelItemComponent: require( "components/list/SettingsChannelItemComponent" ),
		SettingsSubmitComponent: require( "components/SettingsSubmitComponent" ),


		// Content
		FeaturedRoute: require( "routes/FeaturedRoute" ),
		FeaturedController: require( "controllers/FeaturedController" ),
		FeaturedTemplate: require( "templates/Featured.hbs" ),

		WatchingRoute: require( "routes/WatchingRoute" ),
		WatchingController: require( "controllers/WatchingController" ),
		WatchingTemplate: require( "templates/Watching.hbs" ),

		SearchRoute: require( "routes/SearchRoute" ),
		SearchController: require( "controllers/SearchController" ),
		SearchTemplate: require( "templates/Search.hbs" ),

		GamesLoadingRoute: require( "routes/LoadingRoute" ),
		GamesLoadingTemplate: require( "templates/Loading.hbs" ),
		GamesIndexRoute: require( "routes/GamesIndexRoute" ),
		GamesIndexController: require( "controllers/GamesIndexController" ),
		GamesIndexTemplate: require( "templates/games/GamesIndex.hbs" ),
		GamesGameRoute: require( "routes/GamesGameRoute" ),
		GamesGameController: require( "controllers/GamesGameController" ),
		GamesGameTemplate: require( "templates/games/GamesGame.hbs" ),

		ChannelsRoute: require( "routes/ChannelsRoute" ),
		ChannelsController: require( "controllers/ChannelsController" ),
		ChannelsTemplate: require( "templates/Channels.hbs" ),

		ChannelRoute: require( "routes/ChannelRoute" ),
		ChannelController: require( "controllers/ChannelController" ),
		ChannelTemplate: require( "templates/channel/Channel.hbs" ),
		ChannelLoadingRoute: require( "routes/LoadingRoute" ),
		ChannelLoadingTemplate: require( "templates/Loading.hbs" ),
		ChannelIndexRoute: require( "routes/ChannelIndexRoute" ),
		ChannelIndexController: require( "controllers/ChannelIndexController" ),
		ChannelIndexTemplate: require( "templates/channel/ChannelIndex.hbs" ),
		ChannelSettingsRoute: require( "routes/ChannelSettingsRoute" ),
		ChannelSettingsController: require( "controllers/ChannelSettingsController" ),
		ChannelSettingsTemplate: require( "templates/channel/ChannelSettings.hbs" ),

		UserLoadingRoute: require( "routes/LoadingRoute" ),
		UserLoadingTemplate: require( "templates/Loading.hbs" ),
		UserIndexRoute: require( "routes/UserIndexRoute" ),
		UserIndexController: require( "controllers/UserIndexController" ),
		UserIndexTemplate: require( "templates/user/UserIndex.hbs" ),
		UserAuthRoute: require( "routes/UserAuthRoute" ),
		UserAuthController: require( "controllers/UserAuthController" ),
		UserAuthTemplate: require( "templates/user/UserAuth.hbs" ),
		UserSubscriptionsRoute: require( "routes/UserSubscriptionsRoute" ),
		UserSubscriptionsTemplate: require( "templates/user/UserSubscriptions.hbs" ),
		UserFollowedStreamsRoute: require( "routes/UserFollowedStreamsRoute" ),
		UserFollowedStreamsTemplate: require( "templates/user/UserFollowedStreams.hbs" ),
		UserHostedStreamsRoute: require( "routes/UserHostedStreamsRoute" ),
		UserHostedStreamsTemplate: require( "templates/user/UserHostedStreams.hbs" ),
		UserFollowedChannelsRoute: require( "routes/UserFollowedChannelsRoute" ),
		UserFollowedChannelsController: require( "controllers/UserFollowedChannelsController" ),
		UserFollowedChannelsTemplate: require( "templates/user/UserFollowedChannels.hbs" ),
		UserFollowedGamesRoute: require( "routes/UserFollowedGamesRoute" ),
		UserFollowedGamesController: require( "controllers/UserFollowedGamesController" ),
		UserFollowedGamesTemplate: require( "templates/user/UserFollowedGames.hbs" ),

		SettingsRoute: require( "routes/SettingsRoute" ),
		SettingsController: require( "controllers/SettingsController" ),
		SettingsTemplate: require( "templates/settings/Settings.hbs" ),
		SettingsIndexRoute: require( "routes/SettingsIndexRoute" ),
		SettingsMainRoute: require( "routes/SettingsSubmenuRoute" ),
		SettingsMainTemplate: require( "templates/settings/SettingsMain.hbs" ),
		SettingsStreamsRoute: require( "routes/SettingsSubmenuRoute" ),
		SettingsStreamsTemplate: require( "templates/settings/SettingsStreams.hbs" ),
		SettingsLivestreamerRoute: require( "routes/SettingsSubmenuRoute" ),
		SettingsLivestreamerTemplate: require( "templates/settings/SettingsLivestreamer.hbs" ),
		SettingsPlayerRoute: require( "routes/SettingsSubmenuRoute" ),
		SettingsPlayerTemplate: require( "templates/settings/SettingsPlayer.hbs" ),
		SettingsChatRoute: require( "routes/SettingsSubmenuRoute" ),
		SettingsChatTemplate: require( "templates/settings/SettingsChat.hbs" ),
		SettingsGuiRoute: require( "routes/SettingsSubmenuRoute" ),
		SettingsGuiTemplate: require( "templates/settings/SettingsGui.hbs" ),
		SettingsListsRoute: require( "routes/SettingsSubmenuRoute" ),
		SettingsListsTemplate: require( "templates/settings/SettingsLists.hbs" ),
		SettingsLanguagesRoute: require( "routes/SettingsSubmenuRoute" ),
		SettingsLanguagesTemplate: require( "templates/settings/SettingsLanguages.hbs" ),
		SettingsNotificationsRoute: require( "routes/SettingsSubmenuRoute" ),
		SettingsNotificationsTemplate: require( "templates/settings/SettingsNotifications.hbs" ),
		SettingsChannelsRoute: require( "routes/SettingsChannelsRoute" ),
		SettingsChannelsController: require( "controllers/SettingsChannelsController" ),
		SettingsChannelsTemplate: require( "templates/settings/SettingsChannels.hbs" ),

		AboutController: require( "controllers/AboutController" ),
		AboutTemplate: require( "templates/About.hbs" ),


		toString: function() { return "App"; }

	});

});
