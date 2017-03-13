import "Shim";
import { Application } from "Ember";
import DS from "EmberData";
import {} from "EmberDataLS";
import {} from "initializers/initializers";

import Router from "./router";

import ApplicationAdapter from "store/TwitchAdapter";
import BooleanTransform from "store/BooleanTransform";

import Stream from "models/stream/Stream";
import Window from "models/localstorage/Window";
import Settings from "models/localstorage/Settings";
import Versioncheck from "models/localstorage/Versioncheck";
import Auth from "models/localstorage/Auth";
import Search from "models/localstorage/Search";
import ChannelSettings from "models/localstorage/ChannelSettings";

import GithubReleases from "models/github/Releases";
import GithubReleasesAdapter from "store/GithubAdapter";
import GithubReleasesSerializer from "models/github/ReleasesSerializer";

import TwitchRoot from "models/twitch/Root";
import TwitchRootSerializer from "models/twitch/RootSerializer";

import TwitchGame from "models/twitch/Game";
import TwitchGameSerializer from "models/twitch/GameSerializer";
import TwitchGameTop from "models/twitch/GameTop";
import TwitchGameTopSerializer from "models/twitch/GameTopSerializer";
import TwitchGameFollowed from "models/twitch/GameFollowed";
import TwitchGameFollowedAdapter from "models/twitch/GameFollowedAdapter";
import TwitchGameFollowedSerializer from "models/twitch/GameFollowedSerializer";
import TwitchGameFollowedLive from "models/twitch/GameFollowedLive";
import TwitchGameFollowedLiveSerializer from "models/twitch/GameFollowedLiveSerializer";

import TwitchStream from "models/twitch/Stream";
import TwitchStreamAdapter from "models/twitch/StreamAdapter";
import TwitchStreamSerializer from "models/twitch/StreamSerializer";
import TwitchStreamSummary from "models/twitch/StreamSummary";
import TwitchStreamSummarySerializer from "models/twitch/StreamSummarySerializer";
import TwitchStreamFeatured from "models/twitch/StreamFeatured";
import TwitchStreamFeaturedSerializer from "models/twitch/StreamFeaturedSerializer";
import TwitchStreamFollowed from "models/twitch/StreamFollowed";
import TwitchStreamFollowedSerializer from "models/twitch/StreamFollowedSerializer";
import TwitchStreamHosted from "models/twitch/StreamHosted";
import TwitchStreamHostedSerializer from "models/twitch/StreamHostedSerializer";

import TwitchChannel from "models/twitch/Channel";
import TwitchChannelSerializer from "models/twitch/ChannelSerializer";
import TwitchChannelPanel from "models/twitch/ChannelPanel";
import TwitchChannelPanelAdapter from "models/twitch/ChannelPanelAdapter";
import TwitchChannelPanelSerializer from "models/twitch/ChannelPanelSerializer";
import TwitchChannelFollowed from "models/twitch/ChannelFollowed";
import TwitchChannelFollowedSerializer from "models/twitch/ChannelFollowedSerializer";

import TwitchImage from "models/twitch/Image";
import TwitchImageSerializer from "models/twitch/ImageSerializer";

import TwitchSearchGame from "models/twitch/SearchGame";
import TwitchSearchGameSerializer from "models/twitch/SearchGameSerializer";
import TwitchSearchStream from "models/twitch/SearchStream";
import TwitchSearchStreamSerializer from "models/twitch/SearchStreamSerializer";
import TwitchSearchChannel from "models/twitch/SearchChannel";
import TwitchSearchChannelSerializer from "models/twitch/SearchChannelSerializer";

import TwitchUser from "models/twitch/User";
import TwitchUserAdapter from "models/twitch/UserAdapter";
import TwitchUserSerializer from "models/twitch/UserSerializer";

import TwitchSubscription from "models/twitch/Subscription";
import TwitchSubscriptionSerializer from "models/twitch/SubscriptionSerializer";
import TwitchTicket from "models/twitch/Ticket";
import TwitchTicketSerializer from "models/twitch/TicketSerializer";
import TwitchProduct from "models/twitch/Product";
import TwitchProductSerializer from "models/twitch/ProductSerializer";
import TwitchProductEmoticon from "models/twitch/ProductEmoticon";
import TwitchProductEmoticonSerializer from "models/twitch/ProductEmoticonSerializer";

import TwitchTeam from "models/twitch/Team";
import TwitchTeamAdapter from "models/twitch/TeamAdapter";
import TwitchTeamSerializer from "models/twitch/TeamSerializer";

import TwitchCommunity from "models/twitch/Community";
import TwitchCommunitySerializer from "models/twitch/CommunitySerializer";
import TwitchCommunityTop from "models/twitch/CommunityTop";
import TwitchCommunityTopSerializer from "models/twitch/CommunityTopSerializer";

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
import GetIndexHelper from "helpers/GetIndexHelper";

import NwjsService from "services/NwjsService";
import SettingsService from "services/SettingsService";
import AuthService from "services/AuthService";
import ModalService from "services/ModalService";
import VersioncheckService from "services/VersioncheckService";
import StreamingService from "services/StreamingService";
import NotificationService from "services/NotificationService";
import ChatService from "services/ChatService";
import HotkeyService from "services/HotkeyService";

import ApplicationRoute from "routes/ApplicationRoute";

import LoadingRoute from "routes/LoadingRoute";
import LoadingTemplate from "templates/Loading.hbs";

import ErrorRoute from "routes/ErrorRoute";
import ErrorTemplate from "templates/Error.hbs";

import IndexRoute from "routes/IndexRoute";

import TitleBarComponent from "components/TitleBarComponent";
import MainMenuComponent from "components/MainMenuComponent";
import SubMenuComponent from "components/SubMenuComponent";

import EmbeddedLinksComponent from "components/link/EmbeddedLinksComponent";
import ExternalLinkComponent from "components/link/ExternalLinkComponent";
import LinkComponent from "components/link/LinkComponent";
import DocumentationLinkComponent from "components/link/DocumentationLinkComponent";
import FindInternalLinksComponent from "components/link/FindInternalLinksComponent";

import CheckBoxComponent from "components/form/CheckBoxComponent";
import RadioBtnComponent from "components/form/RadioBtnComponent";
import RadioBtnsComponent from "components/form/RadioBtnsComponent";
import DropDownComponent from "components/form/DropDownComponent";
import FileSelectComponent from "components/form/FileSelectComponent";
import TextFieldComponent from "components/form/TextFieldComponent";
import NumberFieldComponent from "components/form/NumberFieldComponent";

import FollowChannelComponent from "components/button/FollowChannelComponent";
import FollowGameComponent from "components/button/FollowGameComponent";
import FormButtonComponent from "components/button/FormButtonComponent";
import OpenChatComponent from "components/button/OpenChatComponent";
import ShareChannelComponent from "components/button/ShareChannelComponent";
import SubscribeChannelComponent from "components/button/SubscribeChannelComponent";
import TwitchEmotesComponent from "components/button/TwitchEmotesComponent";

import ModalServiceComponent from "components/modal/ModalServiceComponent";
import ModalBodyComponent from "components/modal/ModalBodyComponent";
import ModalChangelogComponent from "components/modal/ModalChangelogComponent";
import ModalConfirmComponent from "components/modal/ModalConfirmComponent";
import ModalFirstrunComponent from "components/modal/ModalFirstrunComponent";
import ModalFooterComponent from "components/modal/ModalFooterComponent";
import ModalHeaderComponent from "components/modal/ModalHeaderComponent";
import ModalStreamingComponent from "components/modal/ModalStreamingComponent";
import ModalLogComponent from "components/modal/ModalLogComponent";
import ModalNewreleaseComponent from "components/modal/ModalNewreleaseComponent";
import ModalQuitComponent from "components/modal/ModalQuitComponent";

import ContentListComponent from "components/list/ContentListComponent";
import CommunityItemComponent from "components/list/CommunityItemComponent";
import ChannelItemComponent from "components/list/ChannelItemComponent";
import GameItemComponent from "components/list/GameItemComponent";
import HeadlineTotalsComponent from "components/list/HeadlineTotalsComponent";
import InfiniteScrollComponent from "components/list/InfiniteScrollComponent";
import StreamItemComponent from "components/list/StreamItemComponent";
import SubscriptionItemComponent from "components/list/SubscriptionItemComponent";
import TeamItemComponent from "components/list/TeamItemComponent";

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

import CommunitiesLoadingRoute from "routes/LoadingRoute";
import CommunitiesLoadingTemplate from "templates/Loading.hbs";
import CommunitiesIndexTemplate from "templates/communities/CommunitiesIndex.hbs";
import CommunitiesIndexLoadingRoute from "routes/LoadingRoute";
import CommunitiesIndexLoadingTemplate from "templates/Loading.hbs";
import CommunitiesIndexIndexRoute from "routes/CommunitiesIndexIndexRoute";
import CommunitiesIndexIndexTemplate from "templates/communities/CommunitiesIndexIndex.hbs";
import CommunitiesIndexAllRoute from "routes/CommunitiesIndexAllRoute";
import CommunitiesIndexAllTemplate from "templates/communities/CommunitiesIndexAll.hbs";
import CommunitiesCommunityRoute from "routes/CommunitiesCommunityRoute";
import CommunitiesCommunityTemplate from "templates/communities/CommunitiesCommunity.hbs";
import CommunitiesCommunityLoadingRoute from "routes/LoadingRoute";
import CommunitiesCommunityLoadingTemplate from "templates/Loading.hbs";
import CommunitiesCommunityIndexRoute from "routes/CommunitiesCommunityIndexRoute";
import CommunitiesCommunityIndexTemplate from "templates/communities/CommunitiesCommunityIndex.hbs";
import CommunitiesCommunityInfoRoute from "routes/CommunitiesCommunityInfoRoute";
import CommunitiesCommunityInfoTemplate from "templates/communities/CommunitiesCommunityInfo.hbs";

import StreamsRoute from "routes/StreamsRoute";
import StreamsTemplate from "templates/Streams.hbs";

import ChannelRoute from "routes/ChannelRoute";
import ChannelController from "controllers/ChannelController";
import ChannelTemplate from "templates/channel/Channel.hbs";
import ChannelLoadingRoute from "routes/LoadingRoute";
import ChannelLoadingTemplate from "templates/Loading.hbs";
import ChannelIndexRoute from "routes/ChannelIndexRoute";
import ChannelIndexController from "controllers/ChannelIndexController";
import ChannelIndexTemplate from "templates/channel/ChannelIndex.hbs";
import ChannelTeamsRoute from "routes/ChannelTeamsRoute";
import ChannelTeamsTemplate from "templates/channel/ChannelTeams.hbs";
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
import UserFollowedGamesTemplate from "templates/user/UserFollowedGames.hbs";
import UserFollowedGamesLoadingRoute from "routes/LoadingRoute";
import UserFollowedGamesLoadingTemplate from "templates/Loading.hbs";
import UserFollowedGamesIndexRoute from "routes/UserFollowedGamesIndexRoute";
import UserFollowedGamesIndexTemplate from "templates/user/UserFollowedGamesIndex.hbs";
import UserFollowedGamesAllRoute from "routes/UserFollowedGamesAllRoute";
import UserFollowedGamesAllTemplate from "templates/user/UserFollowedGamesAll.hbs";

import TeamRoute from "routes/TeamRoute";
import TeamTemplate from "templates/team/Team.hbs";
import TeamLoadingRoute from "routes/LoadingRoute";
import TeamLoadingTemplate from "templates/Loading.hbs";
import TeamIndexRoute from "routes/TeamIndexRoute";
import TeamIndexTemplate from "templates/team/TeamIndex.hbs";
import TeamMembersRoute from "routes/TeamMembersRoute";
import TeamMembersTemplate from "templates/team/TeamMembers.hbs";
import TeamInfoRoute from "routes/TeamInfoRoute";
import TeamInfoTemplate from "templates/team/TeamInfo.hbs";

import SettingsRoute from "routes/SettingsRoute";
import SettingsController from "controllers/SettingsController";
import SettingsTemplate from "templates/settings/Settings.hbs";
import SettingsIndexRoute from "routes/SettingsIndexRoute";
import SettingsMainRoute from "routes/SettingsSubmenuRoute";
import SettingsMainController from "controllers/SettingsMainController";
import SettingsMainTemplate from "templates/settings/SettingsMain.hbs";
import SettingsStreamsRoute from "routes/SettingsSubmenuRoute";
import SettingsStreamsController from "controllers/SettingsStreamsController";
import SettingsStreamsTemplate from "templates/settings/SettingsStreams.hbs";
import SettingsStreamproviderRoute from "routes/SettingsSubmenuRoute";
import SettingsStreamproviderController from "controllers/SettingsStreamproviderController";
import SettingsStreamproviderTemplate from "templates/settings/SettingsStreamprovider.hbs";
import SettingsPlayerRoute from "routes/SettingsSubmenuRoute";
import SettingsPlayerController from "controllers/SettingsPlayerController";
import SettingsPlayerTemplate from "templates/settings/SettingsPlayer.hbs";
import SettingsChatRoute from "routes/SettingsSubmenuRoute";
import SettingsChatController from "controllers/SettingsChatController";
import SettingsChatTemplate from "templates/settings/SettingsChat.hbs";
import SettingsGuiRoute from "routes/SettingsSubmenuRoute";
import SettingsGuiController from "controllers/SettingsGuiController";
import SettingsGuiTemplate from "templates/settings/SettingsGui.hbs";
import SettingsListsRoute from "routes/SettingsSubmenuRoute";
import SettingsListsController from "controllers/SettingsListsController";
import SettingsListsTemplate from "templates/settings/SettingsLists.hbs";
import SettingsLanguagesRoute from "routes/SettingsSubmenuRoute";
import SettingsLanguagesController from "controllers/SettingsLanguagesController";
import SettingsLanguagesTemplate from "templates/settings/SettingsLanguages.hbs";
import SettingsNotificationsRoute from "routes/SettingsSubmenuRoute";
import SettingsNotificationsController from "controllers/SettingsNotificationsController";
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
	Stream,
	StreamAdapter: DS.Adapter,


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
	TwitchRoot,
	TwitchRootSerializer,

	TwitchGame,
	TwitchGameSerializer,
	TwitchGameTop,
	TwitchGameTopSerializer,
	TwitchGameFollowed,
	TwitchGameFollowedAdapter,
	TwitchGameFollowedSerializer,
	TwitchGameFollowedLive,
	TwitchGameFollowedLiveSerializer,

	TwitchStream,
	TwitchStreamAdapter,
	TwitchStreamSerializer,
	TwitchStreamSummary,
	TwitchStreamSummarySerializer,
	TwitchStreamFeatured,
	TwitchStreamFeaturedSerializer,
	TwitchStreamFollowed,
	TwitchStreamFollowedSerializer,
	TwitchStreamHosted,
	TwitchStreamHostedSerializer,

	TwitchChannel,
	TwitchChannelSerializer,
	TwitchChannelPanel,
	TwitchChannelPanelAdapter,
	TwitchChannelPanelSerializer,
	TwitchChannelFollowed,
	TwitchChannelFollowedSerializer,

	TwitchImage,
	TwitchImageSerializer,

	TwitchSearchGame,
	TwitchSearchGameSerializer,
	TwitchSearchStream,
	TwitchSearchStreamSerializer,
	TwitchSearchChannel,
	TwitchSearchChannelSerializer,

	TwitchUser,
	TwitchUserAdapter,
	TwitchUserSerializer,

	TwitchSubscription,
	TwitchSubscriptionSerializer,
	TwitchTicket,
	TwitchTicketSerializer,
	TwitchProduct,
	TwitchProductSerializer,
	TwitchProductEmoticon,
	TwitchProductEmoticonSerializer,

	TwitchTeam,
	TwitchTeamAdapter,
	TwitchTeamSerializer,

	TwitchCommunity,
	TwitchCommunitySerializer,
	TwitchCommunityTop,
	TwitchCommunityTopSerializer,


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
	GetIndexHelper,

	// Services
	NwjsService,
	SettingsService,
	AuthService,
	ModalService,
	VersioncheckService,
	StreamingService,
	NotificationService,
	ChatService,
	HotkeyService,


	// Application
	ApplicationRoute,

	LoadingRoute,
	LoadingTemplate,

	ErrorRoute,
	ErrorTemplate,

	IndexRoute,


	// Components
	TitleBarComponent,
	MainMenuComponent,
	SubMenuComponent,

	EmbeddedLinksComponent,
	ExternalLinkComponent,
	LinkComponent,
	DocumentationLinkComponent,
	FindInternalLinksComponent,

	CheckBoxComponent,
	RadioBtnComponent,
	RadioBtnsComponent,
	DropDownComponent,
	FileSelectComponent,
	TextFieldComponent,
	NumberFieldComponent,

	FollowChannelComponent,
	FollowGameComponent,
	FormButtonComponent,
	OpenChatComponent,
	ShareChannelComponent,
	SubscribeChannelComponent,
	TwitchEmotesComponent,

	ModalServiceComponent,
	ModalBodyComponent,
	ModalChangelogComponent,
	ModalConfirmComponent,
	ModalFirstrunComponent,
	ModalFooterComponent,
	ModalHeaderComponent,
	ModalStreamingComponent,
	ModalLogComponent,
	ModalNewreleaseComponent,
	ModalQuitComponent,

	ContentListComponent,
	CommunityItemComponent,
	ChannelItemComponent,
	GameItemComponent,
	HeadlineTotalsComponent,
	InfiniteScrollComponent,
	StreamItemComponent,
	SubscriptionItemComponent,
	TeamItemComponent,

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

	CommunitiesLoadingRoute,
	CommunitiesLoadingTemplate,
	CommunitiesIndexTemplate,
	CommunitiesIndexLoadingRoute,
	CommunitiesIndexLoadingTemplate,
	CommunitiesIndexIndexRoute,
	CommunitiesIndexIndexTemplate,
	CommunitiesIndexAllRoute,
	CommunitiesIndexAllTemplate,
	CommunitiesCommunityRoute,
	CommunitiesCommunityTemplate,
	CommunitiesCommunityLoadingRoute,
	CommunitiesCommunityLoadingTemplate,
	CommunitiesCommunityIndexRoute,
	CommunitiesCommunityIndexTemplate,
	CommunitiesCommunityInfoRoute,
	CommunitiesCommunityInfoTemplate,

	StreamsRoute,
	StreamsTemplate,

	ChannelRoute,
	ChannelController,
	ChannelTemplate,
	ChannelLoadingRoute,
	ChannelLoadingTemplate,
	ChannelIndexRoute,
	ChannelIndexController,
	ChannelIndexTemplate,
	ChannelTeamsRoute,
	ChannelTeamsTemplate,
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
	UserFollowedGamesTemplate,
	UserFollowedGamesLoadingRoute,
	UserFollowedGamesLoadingTemplate,
	UserFollowedGamesIndexRoute,
	UserFollowedGamesIndexTemplate,
	UserFollowedGamesAllRoute,
	UserFollowedGamesAllTemplate,

	TeamRoute,
	TeamTemplate,
	TeamLoadingRoute,
	TeamLoadingTemplate,
	TeamIndexRoute,
	TeamIndexTemplate,
	TeamMembersRoute,
	TeamMembersTemplate,
	TeamInfoRoute,
	TeamInfoTemplate,

	SettingsRoute,
	SettingsController,
	SettingsTemplate,
	SettingsIndexRoute,
	SettingsMainRoute,
	SettingsMainController,
	SettingsMainTemplate,
	SettingsStreamsRoute,
	SettingsStreamsController,
	SettingsStreamsTemplate,
	SettingsStreamproviderRoute,
	SettingsStreamproviderController,
	SettingsStreamproviderTemplate,
	SettingsPlayerRoute,
	SettingsPlayerController,
	SettingsPlayerTemplate,
	SettingsChatRoute,
	SettingsChatController,
	SettingsChatTemplate,
	SettingsGuiRoute,
	SettingsGuiController,
	SettingsGuiTemplate,
	SettingsListsRoute,
	SettingsListsController,
	SettingsListsTemplate,
	SettingsLanguagesRoute,
	SettingsLanguagesController,
	SettingsLanguagesTemplate,
	SettingsNotificationsRoute,
	SettingsNotificationsController,
	SettingsNotificationsTemplate,
	SettingsChannelsRoute,
	SettingsChannelsController,
	SettingsChannelsTemplate,

	AboutController,
	AboutTemplate,


	toString() { return "App"; }

});
