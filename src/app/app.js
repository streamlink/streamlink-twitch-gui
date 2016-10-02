import { Application } from "Ember";
import DS from "EmberData";
import {} from "EmberDataLS";
import nwWindow from "nwjs/nwWindow";
import {} from "initializers/initializers";

import Router from "./router";

import ApplicationAdapter from "store/TwitchAdapter";
import BooleanTransform from "store/BooleanTransform";

import Livestreamer from "models/Livestreamer";
import Window from "models/localstorage/Window";
import Settings from "models/localstorage/Settings";
import Versioncheck from "models/localstorage/Versioncheck";
import Auth from "models/localstorage/Auth";
import Search from "models/localstorage/Search";
import ChannelSettings from "models/localstorage/ChannelSettings";

import GithubReleases from "models/github/Releases";
import GithubReleasesAdapter from "store/GithubAdapter";
import GithubReleasesSerializer from "models/github/ReleasesSerializer";

import TwitchToken from "models/twitch/Token";
import TwitchTokenSerializer from "models/twitch/TokenSerializer";

import TwitchGame from "models/twitch/Game";
import TwitchGameSerializer from "models/twitch/GameSerializer";
import TwitchStream from "models/twitch/Stream";
import TwitchStreamSerializer from "models/twitch/StreamSerializer";
import TwitchChannel from "models/twitch/Channel";
import TwitchChannelSerializer from "models/twitch/ChannelSerializer";
import TwitchImage from "models/twitch/Image";
import TwitchImageSerializer from "models/twitch/ImageSerializer";

import TwitchGamesTop from "models/twitch/GamesTop";
import TwitchGamesTopSerializer from "models/twitch/GamesTopSerializer";
import TwitchStreamsSummary from "models/twitch/StreamsSummary";
import TwitchStreamsSummarySerializer from "models/twitch/StreamsSummarySerializer";
import TwitchStreamsFeatured from "models/twitch/StreamsFeatured";
import TwitchStreamsFeaturedSerializer from "models/twitch/StreamsFeaturedSerializer";

import TwitchStreamsFollowed from "models/twitch/StreamsFollowed";
import TwitchStreamsFollowedSerializer from "models/twitch/StreamsFollowedSerializer";
import TwitchStreamsHosted from "models/twitch/StreamsHosted";
import TwitchStreamsHostedSerializer from "models/twitch/StreamsHostedSerializer";
import TwitchChannelsFollowed from "models/twitch/ChannelsFollowed";
import TwitchChannelsFollowedSerializer from "models/twitch/ChannelsFollowedSerializer";
import TwitchGamesFollowed from "models/twitch/GamesFollowed";
import TwitchGamesFollowedSerializer from "models/twitch/GamesFollowedSerializer";
import TwitchGamesLiveFollowed from "models/twitch/GamesLiveFollowed";
import TwitchGamesLiveFollowedSerializer from "models/twitch/GamesLiveFollowedSerializer";

import TwitchSearchGame from "models/twitch/SearchGame";
import TwitchSearchGameSerializer from "models/twitch/SearchGameSerializer";
import TwitchSearchStream from "models/twitch/SearchStream";
import TwitchSearchStreamSerializer from "models/twitch/SearchStreamSerializer";
import TwitchSearchChannel from "models/twitch/SearchChannel";
import TwitchSearchChannelSerializer from "models/twitch/SearchChannelSerializer";

import TwitchUserFollowsChannel from "models/twitch/UserFollowsChannel";
import TwitchUserFollowsChannelSerializer from "models/twitch/UserFollowsChannelSerializer";
import TwitchUserFollowsGame from "models/twitch/UserFollowsGame";
import TwitchUserFollowsGameAdapter from "models/twitch/UserFollowsGameAdapter";
import TwitchUserFollowsGameSerializer from "models/twitch/UserFollowsGameSerializer";
import TwitchUserSubscription from "models/twitch/UserSubscription";
import TwitchUserSubscriptionSerializer from "models/twitch/UserSubscriptionSerializer";

import TwitchTicket from "models/twitch/Ticket";
import TwitchTicketSerializer from "models/twitch/TicketSerializer";
import TwitchProduct from "models/twitch/Product";
import TwitchProductSerializer from "models/twitch/ProductSerializer";
import TwitchProductEmoticon from "models/twitch/ProductEmoticon";
import TwitchProductEmoticonSerializer from "models/twitch/ProductEmoticonSerializer";

import TwitchChannelPanel from "models/twitch/ChannelPanel";
import TwitchChannelPanelSerializer from "models/twitch/ChannelPanelSerializer";
import TwitchChannelPanelItem from "models/twitch/ChannelPanelItem";
import TwitchChannelPanelItemSerializer from "models/twitch/ChannelPanelItemSerializer";

import IsEqualHelper from "helpers/IsEqualHelper";
import IsNullHelper from "helpers/IsNullHelper";
import IsGtHelper from "helpers/IsGtHelper";
import IsGteHelper from "helpers/IsGteHelper";
import BoolNotHelper from "helpers/BoolNotHelper";
import BoolAndHelper from "helpers/BoolAndHelper";
import BoolOrHelper from "helpers/BoolOrHelper";
import MathAddHelper from "helpers/MathAddHelper";
import MathSubHelper from "helpers/MathSubHelper";
import MathMulHelper from "helpers/MathMulHelper";
import MathDivHelper from "helpers/MathDivHelper";
import FormatViewersHelper from "helpers/FormatViewersHelper";
import FormatTimeHelper from "helpers/FormatTimeHelper";
import HoursFromNowHelper from "helpers/HoursFromNowHelper";
import TimeFromNowHelper from "helpers/TimeFromNowHelper";
import GetParamHelper from "helpers/GetParamHelper";
import HasOwnPropertyHelper from "helpers/HasOwnPropertyHelper";

import SettingsService from "services/SettingsService";
import AuthService from "services/AuthService";
import ModalService from "services/ModalService";
import VersioncheckService from "services/VersioncheckService";
import LivestreamerService from "services/LivestreamerService";
import NotificationService from "services/NotificationService";
import ChatService from "services/ChatService";

import ApplicationRoute from "routes/ApplicationRoute";
import ApplicationController from "controllers/ApplicationController";
import ApplicationView from "components/ApplicationComponent";
import ApplicationTemplate from "templates/Application.hbs";

import LoadingRoute from "routes/LoadingRoute";
import LoadingTemplate from "templates/Loading.hbs";

import ErrorRoute from "routes/ErrorRoute";
import ErrorTemplate from "templates/Error.hbs";

import IndexRoute from "routes/IndexRoute";

import EmbeddedLinksComponent from "components/link/EmbeddedLinksComponent";
import ExternalLinkComponent from "components/link/ExternalLinkComponent";
import LinkComponent from "components/link/LinkComponent";
import DocumentationLinkComponent from "components/link/DocumentationLinkComponent";

import CheckBoxComponent from "components/form/CheckBoxComponent";
import RadioBtnComponent from "components/form/RadioBtnComponent";
import RadioBtnsComponent from "components/form/RadioBtnsComponent";
import DropDownComponent from "components/form/DropDownComponent";
import FileSelectComponent from "components/form/FileSelectComponent";
import TextFieldComponent from "components/form/TextFieldComponent";

import FollowChannelComponent from "components/button/FollowChannelComponent";
import FollowGameComponent from "components/button/FollowGameComponent";
import FormButtonComponent from "components/button/FormButtonComponent";
import OpenChatComponent from "components/button/OpenChatComponent";
import ShareChannelComponent from "components/button/ShareChannelComponent";
import SubscribeChannelComponent from "components/button/SubscribeChannelComponent";
import TwitchEmotesComponent from "components/button/TwitchEmotesComponent";

import ModalBodyComponent from "components/modal/ModalBodyComponent";
import ModalChangelogComponent from "components/modal/ModalChangelogComponent";
import ModalConfirmComponent from "components/modal/ModalConfirmComponent";
import ModalFirstrunComponent from "components/modal/ModalFirstrunComponent";
import ModalFooterComponent from "components/modal/ModalFooterComponent";
import ModalHeaderComponent from "components/modal/ModalHeaderComponent";
import ModalLivestreamerComponent from "components/modal/ModalLivestreamerComponent";
import ModalLogComponent from "components/modal/ModalLogComponent";
import ModalNewreleaseComponent from "components/modal/ModalNewreleaseComponent";
import ModalQuitComponent from "components/modal/ModalQuitComponent";

import ContentListComponent from "components/list/ContentListComponent";
import ChannelItemComponent from "components/list/ChannelItemComponent";
import GameItemComponent from "components/list/GameItemComponent";
import HeadlineTotalsComponent from "components/list/HeadlineTotalsComponent";
import InfiniteScrollComponent from "components/list/InfiniteScrollComponent";
import StreamItemComponent from "components/list/StreamItemComponent";
import SubscriptionItemComponent from "components/list/SubscriptionItemComponent";

import QuickBarComponent from "components/quick/QuickBarComponent";
import QuickBarHomepageComponent from "components/quick/QuickBarHomepageComponent";
import QuickBarRandomStreamComponent from "components/quick/QuickBarRandomStreamComponent";

import ChannelPanelsComponent from "components/channel/ChannelPanelsComponent";
import ChannelPanelItemComponent from "components/channel/ChannelPanelItemComponent";

import StatsRowComponent from "components/stream/StatsRowComponent";
import StreamPresentationComponent from "components/stream/StreamPresentationComponent";
import StreamPreviewImageComponent from "components/stream/StreamPreviewImageComponent";

import FlagIconComponent from "components/FlagIconComponent";
import LoadingSpinnerComponent from "components/LoadingSpinnerComponent";
import PreviewImageComponent from "components/PreviewImageComponent";
import SearchBarComponent from "components/SearchBarComponent";
import SelectableTextComponent from "components/SelectableTextComponent";

import SettingsRowComponent from "components/SettingsRowComponent";
import SettingsChannelItemComponent from "components/list/SettingsChannelItemComponent";
import SettingsSubmitComponent from "components/SettingsSubmitComponent";

import FeaturedRoute from "routes/FeaturedRoute";
import FeaturedController from "controllers/FeaturedController";
import FeaturedTemplate from "templates/Featured.hbs";

import WatchingRoute from "routes/WatchingRoute";
import WatchingController from "controllers/WatchingController";
import WatchingTemplate from "templates/Watching.hbs";

import SearchRoute from "routes/SearchRoute";
import SearchController from "controllers/SearchController";
import SearchTemplate from "templates/Search.hbs";

import GamesLoadingRoute from "routes/LoadingRoute";
import GamesLoadingTemplate from "templates/Loading.hbs";
import GamesIndexRoute from "routes/GamesIndexRoute";
import GamesIndexController from "controllers/GamesIndexController";
import GamesIndexTemplate from "templates/games/GamesIndex.hbs";
import GamesGameRoute from "routes/GamesGameRoute";
import GamesGameController from "controllers/GamesGameController";
import GamesGameTemplate from "templates/games/GamesGame.hbs";

import ChannelsRoute from "routes/ChannelsRoute";
import ChannelsController from "controllers/ChannelsController";
import ChannelsTemplate from "templates/Channels.hbs";

import ChannelRoute from "routes/ChannelRoute";
import ChannelController from "controllers/ChannelController";
import ChannelTemplate from "templates/channel/Channel.hbs";
import ChannelLoadingRoute from "routes/LoadingRoute";
import ChannelLoadingTemplate from "templates/Loading.hbs";
import ChannelIndexRoute from "routes/ChannelIndexRoute";
import ChannelIndexController from "controllers/ChannelIndexController";
import ChannelIndexTemplate from "templates/channel/ChannelIndex.hbs";
import ChannelSettingsRoute from "routes/ChannelSettingsRoute";
import ChannelSettingsController from "controllers/ChannelSettingsController";
import ChannelSettingsTemplate from "templates/channel/ChannelSettings.hbs";

import UserLoadingRoute from "routes/LoadingRoute";
import UserLoadingTemplate from "templates/Loading.hbs";
import UserIndexRoute from "routes/UserIndexRoute";
import UserIndexController from "controllers/UserIndexController";
import UserIndexTemplate from "templates/user/UserIndex.hbs";
import UserAuthRoute from "routes/UserAuthRoute";
import UserAuthController from "controllers/UserAuthController";
import UserAuthTemplate from "templates/user/UserAuth.hbs";
import UserSubscriptionsRoute from "routes/UserSubscriptionsRoute";
import UserSubscriptionsTemplate from "templates/user/UserSubscriptions.hbs";
import UserFollowedStreamsRoute from "routes/UserFollowedStreamsRoute";
import UserFollowedStreamsTemplate from "templates/user/UserFollowedStreams.hbs";
import UserHostedStreamsRoute from "routes/UserHostedStreamsRoute";
import UserHostedStreamsTemplate from "templates/user/UserHostedStreams.hbs";
import UserFollowedChannelsRoute from "routes/UserFollowedChannelsRoute";
import UserFollowedChannelsController from "controllers/UserFollowedChannelsController";
import UserFollowedChannelsTemplate from "templates/user/UserFollowedChannels.hbs";
import UserFollowedGamesRoute from "routes/UserFollowedGamesRoute";
import UserFollowedGamesController from "controllers/UserFollowedGamesController";
import UserFollowedGamesTemplate from "templates/user/UserFollowedGames.hbs";

import SettingsRoute from "routes/SettingsRoute";
import SettingsController from "controllers/SettingsController";
import SettingsTemplate from "templates/settings/Settings.hbs";
import SettingsIndexRoute from "routes/SettingsIndexRoute";
import SettingsMainRoute from "routes/SettingsSubmenuRoute";
import SettingsMainTemplate from "templates/settings/SettingsMain.hbs";
import SettingsStreamsRoute from "routes/SettingsSubmenuRoute";
import SettingsStreamsTemplate from "templates/settings/SettingsStreams.hbs";
import SettingsLivestreamerRoute from "routes/SettingsSubmenuRoute";
import SettingsLivestreamerTemplate from "templates/settings/SettingsLivestreamer.hbs";
import SettingsPlayerRoute from "routes/SettingsSubmenuRoute";
import SettingsPlayerTemplate from "templates/settings/SettingsPlayer.hbs";
import SettingsChatRoute from "routes/SettingsSubmenuRoute";
import SettingsChatTemplate from "templates/settings/SettingsChat.hbs";
import SettingsGuiRoute from "routes/SettingsSubmenuRoute";
import SettingsGuiTemplate from "templates/settings/SettingsGui.hbs";
import SettingsListsRoute from "routes/SettingsSubmenuRoute";
import SettingsListsTemplate from "templates/settings/SettingsLists.hbs";
import SettingsLanguagesRoute from "routes/SettingsSubmenuRoute";
import SettingsLanguagesTemplate from "templates/settings/SettingsLanguages.hbs";
import SettingsNotificationsRoute from "routes/SettingsSubmenuRoute";
import SettingsNotificationsTemplate from "templates/settings/SettingsNotifications.hbs";
import SettingsChannelsRoute from "routes/SettingsChannelsRoute";
import SettingsChannelsController from "controllers/SettingsChannelsController";
import SettingsChannelsTemplate from "templates/settings/SettingsChannels.hbs";

import AboutController from "controllers/AboutController";
import AboutTemplate from "templates/About.hbs";


export default Application.create({

	// Configuration
	rootElement: document.documentElement,


	// Routing
	Router,


	// Store
	ApplicationAdapter,
	BooleanTransform,


	// Models: memory
	Livestreamer,
	LivestreamerAdapter: DS.Adapter,


	// Models: localstorage
	Window,
	WindowAdapter: DS.LSAdapter.extend({ namespace: "window" }),
	WindowSerializer: DS.LSSerializer,
	Settings,
	SettingsAdapter: DS.LSAdapter.extend({ namespace: "settings" }),
	SettingsSerializer: DS.LSSerializer,
	Versioncheck,
	VersioncheckAdapter: DS.LSAdapter.extend({ namespace: "versioncheck" }),
	VersioncheckSerializer: DS.LSSerializer,
	Auth,
	AuthAdapter: DS.LSAdapter.extend({ namespace: "auth" }),
	AuthSerializer: DS.LSSerializer,
	Search,
	SearchAdapter: DS.LSAdapter.extend({ namespace: "search" }),
	SearchSerializer: DS.LSSerializer,
	ChannelSettings,
	ChannelSettingsAdapter: DS.LSAdapter.extend({ namespace: "channelsettings" }),
	ChannelSettingsSerializer: DS.LSSerializer,


	// Models: github
	GithubReleases,
	GithubReleasesAdapter,
	GithubReleasesSerializer,


	// Models: twitch
	TwitchToken,
	TwitchTokenSerializer,

	TwitchGame,
	TwitchGameSerializer,
	TwitchStream,
	TwitchStreamSerializer,
	TwitchChannel,
	TwitchChannelSerializer,
	TwitchImage,
	TwitchImageSerializer,

	TwitchGamesTop,
	TwitchGamesTopSerializer,
	TwitchStreamsSummary,
	TwitchStreamsSummarySerializer,
	TwitchStreamsFeatured,
	TwitchStreamsFeaturedSerializer,

	TwitchStreamsFollowed,
	TwitchStreamsFollowedSerializer,
	TwitchStreamsHosted,
	TwitchStreamsHostedSerializer,
	TwitchChannelsFollowed,
	TwitchChannelsFollowedSerializer,
	TwitchGamesFollowed,
	TwitchGamesFollowedSerializer,
	TwitchGamesLiveFollowed,
	TwitchGamesLiveFollowedSerializer,

	TwitchSearchGame,
	TwitchSearchGameSerializer,
	TwitchSearchStream,
	TwitchSearchStreamSerializer,
	TwitchSearchChannel,
	TwitchSearchChannelSerializer,

	TwitchUserFollowsChannel,
	TwitchUserFollowsChannelSerializer,
	TwitchUserFollowsGame,
	TwitchUserFollowsGameAdapter,
	TwitchUserFollowsGameSerializer,
	TwitchUserSubscription,
	TwitchUserSubscriptionSerializer,

	TwitchTicket,
	TwitchTicketSerializer,
	TwitchProduct,
	TwitchProductSerializer,
	TwitchProductEmoticon,
	TwitchProductEmoticonSerializer,

	TwitchChannelPanel,
	TwitchChannelPanelSerializer,
	TwitchChannelPanelItem,
	TwitchChannelPanelItemSerializer,


	// Helpers
	IsEqualHelper,
	IsNullHelper,
	IsGtHelper,
	IsGteHelper,
	BoolNotHelper,
	BoolAndHelper,
	BoolOrHelper,
	MathAddHelper,
	MathSubHelper,
	MathMulHelper,
	MathDivHelper,
	FormatViewersHelper,
	FormatTimeHelper,
	HoursFromNowHelper,
	TimeFromNowHelper,
	GetParamHelper,
	HasOwnPropertyHelper,

	// Services
	SettingsService,
	AuthService,
	ModalService,
	VersioncheckService,
	LivestreamerService,
	NotificationService,
	ChatService,


	// Application
	ApplicationRoute,
	ApplicationController,
	ApplicationView,
	ApplicationTemplate,

	LoadingRoute,
	LoadingTemplate,

	ErrorRoute,
	ErrorTemplate,

	IndexRoute,


	// Components
	EmbeddedLinksComponent,
	ExternalLinkComponent,
	LinkComponent,
	DocumentationLinkComponent,

	CheckBoxComponent,
	RadioBtnComponent,
	RadioBtnsComponent,
	DropDownComponent,
	FileSelectComponent,
	TextFieldComponent,

	FollowChannelComponent,
	FollowGameComponent,
	FormButtonComponent,
	OpenChatComponent,
	ShareChannelComponent,
	SubscribeChannelComponent,
	TwitchEmotesComponent,

	ModalBodyComponent,
	ModalChangelogComponent,
	ModalConfirmComponent,
	ModalFirstrunComponent,
	ModalFooterComponent,
	ModalHeaderComponent,
	ModalLivestreamerComponent,
	ModalLogComponent,
	ModalNewreleaseComponent,
	ModalQuitComponent,

	ContentListComponent,
	ChannelItemComponent,
	GameItemComponent,
	HeadlineTotalsComponent,
	InfiniteScrollComponent,
	StreamItemComponent,
	SubscriptionItemComponent,

	QuickBarComponent,
	QuickBarHomepageComponent,
	QuickBarRandomStreamComponent,

	ChannelPanelsComponent,
	ChannelPanelItemComponent,

	StatsRowComponent,
	StreamPresentationComponent,
	StreamPreviewImageComponent,

	FlagIconComponent,
	LoadingSpinnerComponent,
	PreviewImageComponent,
	SearchBarComponent,
	SelectableTextComponent,

	SettingsRowComponent,
	SettingsChannelItemComponent,
	SettingsSubmitComponent,


	// Content
	FeaturedRoute,
	FeaturedController,
	FeaturedTemplate,

	WatchingRoute,
	WatchingController,
	WatchingTemplate,

	SearchRoute,
	SearchController,
	SearchTemplate,

	GamesLoadingRoute,
	GamesLoadingTemplate,
	GamesIndexRoute,
	GamesIndexController,
	GamesIndexTemplate,
	GamesGameRoute,
	GamesGameController,
	GamesGameTemplate,

	ChannelsRoute,
	ChannelsController,
	ChannelsTemplate,

	ChannelRoute,
	ChannelController,
	ChannelTemplate,
	ChannelLoadingRoute,
	ChannelLoadingTemplate,
	ChannelIndexRoute,
	ChannelIndexController,
	ChannelIndexTemplate,
	ChannelSettingsRoute,
	ChannelSettingsController,
	ChannelSettingsTemplate,

	UserLoadingRoute,
	UserLoadingTemplate,
	UserIndexRoute,
	UserIndexController,
	UserIndexTemplate,
	UserAuthRoute,
	UserAuthController,
	UserAuthTemplate,
	UserSubscriptionsRoute,
	UserSubscriptionsTemplate,
	UserFollowedStreamsRoute,
	UserFollowedStreamsTemplate,
	UserHostedStreamsRoute,
	UserHostedStreamsTemplate,
	UserFollowedChannelsRoute,
	UserFollowedChannelsController,
	UserFollowedChannelsTemplate,
	UserFollowedGamesRoute,
	UserFollowedGamesController,
	UserFollowedGamesTemplate,

	SettingsRoute,
	SettingsController,
	SettingsTemplate,
	SettingsIndexRoute,
	SettingsMainRoute,
	SettingsMainTemplate,
	SettingsStreamsRoute,
	SettingsStreamsTemplate,
	SettingsLivestreamerRoute,
	SettingsLivestreamerTemplate,
	SettingsPlayerRoute,
	SettingsPlayerTemplate,
	SettingsChatRoute,
	SettingsChatTemplate,
	SettingsGuiRoute,
	SettingsGuiTemplate,
	SettingsListsRoute,
	SettingsListsTemplate,
	SettingsLanguagesRoute,
	SettingsLanguagesTemplate,
	SettingsNotificationsRoute,
	SettingsNotificationsTemplate,
	SettingsChannelsRoute,
	SettingsChannelsController,
	SettingsChannelsTemplate,

	AboutController,
	AboutTemplate,


	// ready event
	ready() {
		nwWindow.emit( "ready" );
	},

	toString() { return "App"; }

});
