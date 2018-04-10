/*
 * TODO:
 * Write a webpack loader that automatically builds this file by analysing the app file system...
 * Wait for ember's new module structure to be finalized, so that we can build something similar
 * in hope of some day being able to migrate to ember-cli once all compatibility and build issues
 * are resolved.
 */


import Router from "./router";

import ApplicationAdapter from "store/TwitchAdapter";

import Stream from "models/stream/Stream";
import StreamAdapter from "models/stream/StreamAdapter";

import Window from "models/localstorage/Window";
import WindowAdapter from "models/localstorage/Window/adapter";
import WindowSerializer from "models/localstorage/Window/serializer";

import Settings from "models/localstorage/Settings";
import SettingsAdapter from "models/localstorage/Settings/adapter";
import SettingsSerializer from "models/localstorage/Settings/serializer";
import SettingsGui from "models/localstorage/Settings/gui";
import SettingsStreaming from "models/localstorage/Settings/streaming";
import SettingsStreamingProviders from "models/localstorage/Settings/streamingProviders";
import SettingsStreamingProvider from "models/localstorage/Settings/streamingProvider";
import SettingsStreamingQualities from "models/localstorage/Settings/streamingQualities";
import SettingsStreamingQualitiesOld from "models/localstorage/Settings/streamingQualitiesOld";
import SettingsStreamingQuality from "models/localstorage/Settings/streamingQuality";
import SettingsStreamingPlayers from "models/localstorage/Settings/streamingPlayers";
import SettingsStreamingPlayer from "models/localstorage/Settings/streamingPlayer";
import SettingsStreamingPlayerSerializer
	from "models/localstorage/Settings/streamingPlayerSerializer";
import SettingsStreams from "models/localstorage/Settings/streams";
import SettingsStreamsLanguages from "models/localstorage/Settings/streamsLanguages";
import SettingsChat from "models/localstorage/Settings/chat";
import SettingsChatProviders from "models/localstorage/Settings/chatProviders";
import SettingsChatProvider from "models/localstorage/Settings/chatProvider";
import SettingsChatProviderSerializer from "models/localstorage/Settings/chatProviderSerializer";
import SettingsNotification from "models/localstorage/Settings/notification";

import Versioncheck from "models/localstorage/Versioncheck";
import VersioncheckAdapter from "models/localstorage/Versioncheck/adapter";
import VersioncheckSerializer from "models/localstorage/Versioncheck/serializer";

import Auth from "models/localstorage/Auth";
import AuthAdapter from "models/localstorage/Auth/adapter";
import AuthSerializer from "models/localstorage/Auth/serializer";

import Search from "models/localstorage/Search";
import SearchAdapter from "models/localstorage/Search/adapter";
import SearchSerializer from "models/localstorage/Search/serializer";

import ChannelSettings from "models/localstorage/ChannelSettings";
import ChannelSettingsAdapter from "models/localstorage/ChannelSettings/adapter";
import ChannelSettingsSerializer from "models/localstorage/ChannelSettings/serializer";

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

import THelper from "helpers/THelper";
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
import FindByHelper from "helpers/FindByHelper";
import HotkeyTitleHelper from "helpers/HotkeyTitleHelper";

import I18nService from "services/I18nService";
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
import ApplicationTemplate from "templates/Application.hbs";

import LoadingRoute from "ui/routes/loading/route";
import LoadingTemplate from "ui/routes/loading/template.hbs";

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
import EmbeddedHtmlLinksComponent from "components/link/EmbeddedHtmlLinksComponent";

import DropDownComponent from "components/form/DropDownComponent";
import DropDownSelectionComponent from "components/form/DropDownComponent/selection";
import DropDownListComponent from "components/form/DropDownComponent/list";
import RadioButtonsComponent from "components/form/RadioButtonsComponent";
import RadioButtonsItemComponent from "components/form/RadioButtonsComponent/item";
import CheckBoxComponent from "components/form/CheckBoxComponent";
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

import GamesLoadingRoute from "ui/routes/games/loading/route";
import GamesIndexRoute from "ui/routes/games/index/route";
import GamesIndexTemplate from "ui/routes/games/index/template.hbs";
import GamesGameRoute from "ui/routes/games/game/route";
import GamesGameTemplate from "ui/routes/games/game/template.hbs";

import CommunitiesLoadingRoute from "ui/routes/communities/loading/route";
import CommunitiesIndexTemplate from "ui/routes/communities/index/template.hbs";
import CommunitiesIndexLoadingRoute from "ui/routes/communities/index/loading/route";
import CommunitiesIndexIndexRoute from "ui/routes/communities/index/index/route";
import CommunitiesIndexIndexTemplate from "ui/routes/communities/index/index/template.hbs";
import CommunitiesIndexAllRoute from "ui/routes/communities/index/all/route";
import CommunitiesIndexAllTemplate from "ui/routes/communities/index/all/template.hbs";
import CommunitiesCommunityRoute from "ui/routes/communities/community/route";
import CommunitiesCommunityTemplate from "ui/routes/communities/community/template.hbs";
import CommunitiesCommunityLoadingRoute from "ui/routes/communities/community/loading/route";
import CommunitiesCommunityIndexRoute from "ui/routes/communities/community/index/route";
import CommunitiesCommunityIndexTemplate from "ui/routes/communities/community/index/template.hbs";
import CommunitiesCommunityInfoRoute from "ui/routes/communities/community/info/route";
import CommunitiesCommunityInfoTemplate from "ui/routes/communities/community/info/template.hbs";

import StreamsRoute from "routes/StreamsRoute";
import StreamsTemplate from "templates/Streams.hbs";

import ChannelRoute from "ui/routes/channel/route";
import ChannelController from "ui/routes/channel/controller";
import ChannelTemplate from "ui/routes/channel/template.hbs";
import ChannelLoadingRoute from "ui/routes/loading/route";
import ChannelIndexRoute from "ui/routes/channel/index/route";
import ChannelIndexController from "ui/routes/channel/index/controller";
import ChannelIndexTemplate from "ui/routes/channel/index/template.hbs";
import ChannelTeamsRoute from "ui/routes/channel/teams/route";
import ChannelTeamsTemplate from "ui/routes/channel/teams/template.hbs";
import ChannelSettingsRoute from "ui/routes/channel/settings/route";
import ChannelSettingsController from "ui/routes/channel/settings/controller";
import ChannelSettingsTemplate from "ui/routes/channel/settings/template.hbs";

import UserLoadingRoute from "ui/routes/user/loading/route";
import UserIndexRoute from "ui/routes/user/index/route";
import UserIndexController from "ui/routes/user/index/controller";
import UserIndexTemplate from "ui/routes/user/index/template.hbs";
import UserAuthRoute from "ui/routes/user/auth/route";
import UserAuthController from "ui/routes/user/auth/controller";
import UserAuthTemplate from "ui/routes/user/auth/template.hbs";
import UserSubscriptionsRoute from "ui/routes/user/subscriptions/route";
import UserSubscriptionsTemplate from "ui/routes/user/subscriptions/template.hbs";
import UserFollowedStreamsRoute from "ui/routes/user/followed-streams/route";
import UserFollowedStreamsTemplate from "ui/routes/user/followed-streams/template.hbs";
import UserHostedStreamsRoute from "ui/routes/user/hosted-streams/route";
import UserHostedStreamsTemplate from "ui/routes/user/hosted-streams/template.hbs";
import UserFollowedChannelsRoute from "ui/routes/user/followed-channels/route";
import UserFollowedChannelsController from "ui/routes/user/followed-channels/controller";
import UserFollowedChannelsTemplate from "ui/routes/user/followed-channels/template.hbs";
import UserFollowedGamesTemplate from "ui/routes/user/followed-games/template.hbs";
import UserFollowedGamesLoadingRoute from "ui/routes/user/followed-games/loading/route";
import UserFollowedGamesIndexRoute from "ui/routes/user/followed-games/index/route";
import UserFollowedGamesIndexTemplate from "ui/routes/user/followed-games/index/template.hbs";
import UserFollowedGamesAllRoute from "ui/routes/user/followed-games/all/route";
import UserFollowedGamesAllTemplate from "ui/routes/user/followed-games/all/template.hbs";

import TeamRoute from "ui/routes/team/route";
import TeamTemplate from "ui/routes/team/template.hbs";
import TeamLoadingRoute from "ui/routes/team/loading/route";
import TeamIndexRoute from "ui/routes/team/index/route";
import TeamIndexTemplate from "ui/routes/team/index/template.hbs";
import TeamMembersRoute from "ui/routes/team/members/route";
import TeamMembersTemplate from "ui/routes/team/members/template.hbs";
import TeamInfoRoute from "ui/routes/team/info/route";
import TeamInfoTemplate from "ui/routes/team/info/template.hbs";

import SettingsRoute from "ui/routes/settings/route";
import SettingsController from "ui/routes/settings/controller";
import SettingsTemplate from "ui/routes/settings/template.hbs";
import SettingsIndexRoute from "ui/routes/settings/index/route";
import SettingsMainRoute from "ui/routes/settings/main/route";
import SettingsMainController from "ui/routes/settings/main/controller";
import SettingsMainTemplate from "ui/routes/settings/main/template.hbs";
import SettingsStreamsRoute from "ui/routes/settings/streams/route";
import SettingsStreamsController from "ui/routes/settings/streams/controller";
import SettingsStreamsTemplate from "ui/routes/settings/streams/template.hbs";
import SettingsStreamingRoute from "ui/routes/settings/streaming/route";
import SettingsStreamingController from "ui/routes/settings/streaming/controller";
import SettingsStreamingTemplate from "ui/routes/settings/streaming/template.hbs";
import SettingsPlayerRoute from "ui/routes/settings/player/route";
import SettingsPlayerController from "ui/routes/settings/player/controller";
import SettingsPlayerTemplate from "ui/routes/settings/player/template.hbs";
import SettingsChatRoute from "ui/routes/settings/chat/route";
import SettingsChatController from "ui/routes/settings/chat/controller";
import SettingsChatTemplate from "ui/routes/settings/chat/template.hbs";
import SettingsGuiRoute from "ui/routes/settings/gui/route";
import SettingsGuiController from "ui/routes/settings/gui/controller";
import SettingsGuiTemplate from "ui/routes/settings/gui/template.hbs";
import SettingsListsRoute from "ui/routes/settings/lists/route";
import SettingsListsController from "ui/routes/settings/lists/controller";
import SettingsListsTemplate from "ui/routes/settings/lists/template.hbs";
import SettingsLanguagesRoute from "ui/routes/settings/languages/route";
import SettingsLanguagesController from "ui/routes/settings/languages/controller";
import SettingsLanguagesTemplate from "ui/routes/settings/languages/template.hbs";
import SettingsNotificationsRoute from "ui/routes/settings/notifications/route";
import SettingsNotificationsController from "ui/routes/settings/notifications/controller";
import SettingsNotificationsTemplate from "ui/routes/settings/notifications/template.hbs";
import SettingsChannelsRoute from "ui/routes/settings/channels/route";
import SettingsChannelsController from "ui/routes/settings/channels/controller";
import SettingsChannelsTemplate from "ui/routes/settings/channels/template.hbs";

import AboutController from "controllers/AboutController";
import AboutTemplate from "templates/About.hbs";


export default {
	// Routing
	Router,


	// Store
	ApplicationAdapter,


	// Models: memory
	Stream,
	StreamAdapter,


	// Models: localstorage
	Window,
	WindowAdapter,
	WindowSerializer,

	Settings,
	SettingsAdapter,
	SettingsSerializer,
	SettingsGui,
	SettingsStreaming,
	SettingsStreamingProviders,
	SettingsStreamingProvider,
	SettingsStreamingQualities,
	SettingsStreamingQualitiesOld,
	SettingsStreamingQuality,
	SettingsStreamingPlayers,
	SettingsStreamingPlayer,
	SettingsStreamingPlayerSerializer,
	SettingsStreams,
	SettingsStreamsLanguages,
	SettingsChat,
	SettingsChatProviders,
	SettingsChatProvider,
	SettingsChatProviderSerializer,
	SettingsNotification,

	Versioncheck,
	VersioncheckAdapter,
	VersioncheckSerializer,

	Auth,
	AuthAdapter,
	AuthSerializer,

	Search,
	SearchAdapter,
	SearchSerializer,

	ChannelSettings,
	ChannelSettingsAdapter,
	ChannelSettingsSerializer,


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
	THelper,
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
	FindByHelper,
	HotkeyTitleHelper,


	// Services
	I18nService,
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
	ApplicationTemplate,

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
	EmbeddedHtmlLinksComponent,

	DropDownComponent,
	DropDownSelectionComponent,
	DropDownListComponent,
	RadioButtonsComponent,
	RadioButtonsItemComponent,
	CheckBoxComponent,
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
	GamesIndexRoute,
	GamesIndexTemplate,
	GamesGameRoute,
	GamesGameTemplate,

	CommunitiesLoadingRoute,
	CommunitiesIndexTemplate,
	CommunitiesIndexLoadingRoute,
	CommunitiesIndexIndexRoute,
	CommunitiesIndexIndexTemplate,
	CommunitiesIndexAllRoute,
	CommunitiesIndexAllTemplate,
	CommunitiesCommunityRoute,
	CommunitiesCommunityTemplate,
	CommunitiesCommunityLoadingRoute,
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
	ChannelIndexRoute,
	ChannelIndexController,
	ChannelIndexTemplate,
	ChannelTeamsRoute,
	ChannelTeamsTemplate,
	ChannelSettingsRoute,
	ChannelSettingsController,
	ChannelSettingsTemplate,

	UserLoadingRoute,
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
	UserFollowedGamesTemplate,
	UserFollowedGamesLoadingRoute,
	UserFollowedGamesIndexRoute,
	UserFollowedGamesIndexTemplate,
	UserFollowedGamesAllRoute,
	UserFollowedGamesAllTemplate,

	TeamRoute,
	TeamTemplate,
	TeamLoadingRoute,
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
	SettingsStreamingRoute,
	SettingsStreamingController,
	SettingsStreamingTemplate,
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
	AboutTemplate
};
