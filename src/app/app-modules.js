/*
 * TODO:
 * Write a webpack loader that automatically builds this file by analysing the app file system...
 * Wait for ember's new module structure to be finalized, so that we can build something similar
 * in hope of some day being able to migrate to ember-cli once all compatibility and build issues
 * are resolved.
 */


import Router from "./router";

import ApplicationAdapter from "data/models/application/adapter";

import Stream from "data/models/stream/model";
import StreamAdapter from "data/models/stream/adapter";

import Window from "data/models/window/model";
import WindowAdapter from "data/models/window/adapter";
import WindowSerializer from "data/models/window/serializer";

import Settings from "data/models/settings/model";
import SettingsAdapter from "data/models/settings/adapter";
import SettingsSerializer from "data/models/settings/serializer";
import SettingsGui from "data/models/settings/gui/fragment";
import SettingsStreaming from "data/models/settings/streaming/fragment";
import SettingsStreamingProviders from "data/models/settings/streaming/providers/fragment";
import SettingsStreamingProvider from "data/models/settings/streaming/provider/fragment";
import SettingsStreamingQualities from "data/models/settings/streaming/qualities/fragment";
import SettingsStreamingQualitiesOld from "data/models/settings/streaming/qualities-old/fragment";
import SettingsStreamingQuality from "data/models/settings/streaming/quality/fragment";
import SettingsStreamingPlayers from "data/models/settings/streaming/players/fragment";
import SettingsStreamingPlayer from "data/models/settings/streaming/player/fragment";
import SettingsStreamingPlayerSerializer from "data/models/settings/streaming/player/serializer";
import SettingsStreams from "data/models/settings/streams/fragment";
import SettingsStreamsLanguages from "data/models/settings/streams/languages/fragment";
import SettingsChat from "data/models/settings/chat/fragment";
import SettingsChatProviders from "data/models/settings/chat/providers/fragment";
import SettingsChatProvider from "data/models/settings/chat/provider/fragment";
import SettingsChatProviderSerializer from "data/models/settings/chat/provider/serializer";
import SettingsNotification from "data/models/settings/notification/fragment";

import Versioncheck from "data/models/versioncheck/model";
import VersioncheckAdapter from "data/models/versioncheck/adapter";
import VersioncheckSerializer from "data/models/versioncheck/serializer";

import Auth from "data/models/auth/model";
import AuthAdapter from "data/models/auth/adapter";
import AuthSerializer from "data/models/auth/serializer";

import Search from "data/models/search/model";
import SearchAdapter from "data/models/search/adapter";
import SearchSerializer from "data/models/search/serializer";

import ChannelSettings from "data/models/channel-settings/model";
import ChannelSettingsAdapter from "data/models/channel-settings/adapter";
import ChannelSettingsSerializer from "data/models/channel-settings/serializer";

import GithubReleases from "data/models/github/releases/model";
import GithubReleasesAdapter from "data/models/github/releases/adapter";
import GithubReleasesSerializer from "data/models/github/releases/serializer";

import TwitchRoot from "data/models/twitch/root/model";
import TwitchRootSerializer from "data/models/twitch/root/serializer";

import TwitchGame from "data/models/twitch/game/model";
import TwitchGameSerializer from "data/models/twitch/game/serializer";
import TwitchGameTop from "data/models/twitch/game-top/model";
import TwitchGameTopSerializer from "data/models/twitch/game-top/serializer";
import TwitchGameFollowed from "data/models/twitch/game-followed/model";
import TwitchGameFollowedSerializer from "data/models/twitch/game-followed/serializer";
import TwitchGameFollowedLive from "data/models/twitch/game-followed-live/model";
import TwitchGameFollowedLiveSerializer from "data/models/twitch/game-followed-live/serializer";

import TwitchStream from "data/models/twitch/stream/model";
import TwitchStreamAdapter from "data/models/twitch/stream/adapter";
import TwitchStreamSerializer from "data/models/twitch/stream/serializer";
import TwitchStreamSummary from "data/models/twitch/stream-summary/model";
import TwitchStreamSummarySerializer from "data/models/twitch/stream-summary/serializer";
import TwitchStreamFeatured from "data/models/twitch/stream-featured/model";
import TwitchStreamFeaturedSerializer from "data/models/twitch/stream-featured/serializer";
import TwitchStreamFollowed from "data/models/twitch/stream-followed/model";
import TwitchStreamFollowedSerializer from "data/models/twitch/stream-followed/serializer";
import TwitchStreamHosted from "data/models/twitch/stream-hosted/model";
import TwitchStreamHostedSerializer from "data/models/twitch/stream-hosted/serializer";

import TwitchChannel from "data/models/twitch/channel/model";
import TwitchChannelSerializer from "data/models/twitch/channel/serializer";
import TwitchChannelPanel from "data/models/twitch/channel-panel/model";
import TwitchChannelPanelAdapter from "data/models/twitch/channel-panel/adapter";
import TwitchChannelPanelSerializer from "data/models/twitch/channel-panel/serializer";
import TwitchChannelFollowed from "data/models/twitch/channel-followed/model";
import TwitchChannelFollowedSerializer from "data/models/twitch/channel-followed/serializer";

import TwitchImage from "data/models/twitch/image/model";
import TwitchImageSerializer from "data/models/twitch/image/serializer";

import TwitchSearchGame from "data/models/twitch/search-game/model";
import TwitchSearchGameSerializer from "data/models/twitch/search-game/serializer";
import TwitchSearchStream from "data/models/twitch/search-stream/model";
import TwitchSearchStreamSerializer from "data/models/twitch/search-stream/serializer";
import TwitchSearchChannel from "data/models/twitch/search-channel/model";
import TwitchSearchChannelSerializer from "data/models/twitch/search-channel/serializer";

import TwitchUser from "data/models/twitch/user/model";
import TwitchUserAdapter from "data/models/twitch/user/adapter";
import TwitchUserSerializer from "data/models/twitch/user/serializer";

import TwitchSubscription from "data/models/twitch/subscription/model";
import TwitchSubscriptionSerializer from "data/models/twitch/subscription/serializer";
import TwitchTicket from "data/models/twitch/ticket/model";
import TwitchTicketSerializer from "data/models/twitch/ticket/serializer";
import TwitchProduct from "data/models/twitch/product/model";
import TwitchProductSerializer from "data/models/twitch/product/serializer";
import TwitchProductEmoticon from "data/models/twitch/product-emoticon/model";
import TwitchProductEmoticonSerializer from "data/models/twitch/product-emoticon/serializer";

import TwitchTeam from "data/models/twitch/team/model";
import TwitchTeamAdapter from "data/models/twitch/team/adapter";
import TwitchTeamSerializer from "data/models/twitch/team/serializer";

import TwitchCommunity from "data/models/twitch/community/model";
import TwitchCommunitySerializer from "data/models/twitch/community/serializer";
import TwitchCommunityTop from "data/models/twitch/community-top/model";
import TwitchCommunityTopSerializer from "data/models/twitch/community-top/serializer";

import { helper as THelper } from "ui/components/helper/t";
import { helper as IsEqualHelper } from "ui/components/helper/is-equal";
import { helper as IsNullHelper } from "ui/components/helper/is-null";
import { helper as IsGtHelper } from "ui/components/helper/is-gt";
import { helper as IsGteHelper } from "ui/components/helper/is-gte";
import { helper as BoolNotHelper } from "ui/components/helper/bool-not";
import { helper as BoolAndHelper } from "ui/components/helper/bool-and";
import { helper as BoolOrHelper } from "ui/components/helper/bool-or";
import { helper as MathAddHelper } from "ui/components/helper/math-add";
import { helper as MathSubHelper } from "ui/components/helper/math-sub";
import { helper as MathMulHelper } from "ui/components/helper/math-mul";
import { helper as MathDivHelper } from "ui/components/helper/math-div";
import { helper as FormatViewersHelper } from "ui/components/helper/format-viewers";
import { helper as FormatTimeHelper } from "ui/components/helper/format-time";
import { helper as HoursFromNowHelper } from "ui/components/helper/hours-from-now";
import { helper as TimeFromNowHelper } from "ui/components/helper/time-from-now";
import { helper as GetParamHelper } from "ui/components/helper/get-param";
import { helper as GetIndexHelper } from "ui/components/helper/get-index";
import { helper as FindByHelper } from "ui/components/helper/find-by";
import { helper as HotkeyTitleHelper } from "ui/components/helper/hotkey-title";

import I18nService from "services/i18n";
import NwjsService from "services/nwjs";
import SettingsService from "services/settings";
import AuthService from "services/auth";
import ModalService from "services/modal";
import VersioncheckService from "services/versioncheck";
import StreamingService from "services/streaming/service";
import NotificationService from "services/notification/service";
import ChatService from "services/chat/service";
import HotkeyService from "services/hotkey/service";

import ApplicationRoute from "ui/routes/application/route";
import ApplicationTemplate from "ui/routes/application/template.hbs";

import LoadingRoute from "ui/routes/loading/route";
import LoadingTemplate from "ui/routes/loading/template.hbs";

import ErrorRoute from "ui/routes/error/route";
import ErrorTemplate from "ui/routes/error/template.hbs";

import IndexRoute from "ui/routes/index/route";

import TitleBarComponent from "ui/components/title-bar/component";
import MainMenuComponent from "ui/components/main-menu/component";
import SubMenuComponent from "ui/components/sub-menu/component";

import EmbeddedLinksComponent from "ui/components/link/embedded-links/component";
import ExternalLinkComponent from "ui/components/link/external-link/component";
import LinkComponent from "ui/components/link/link/component";
import DocumentationLinkComponent from "ui/components/link/documentation-link/component";
import EmbeddedHtmlLinksComponent from "ui/components/link/embedded-html-links/component";

import DropDownComponent from "ui/components/form/drop-down/component";
import DropDownSelectionComponent from "ui/components/form/drop-down-selection/component";
import DropDownListComponent from "ui/components/form/drop-down-list/component";
import RadioButtonsComponent from "ui/components/form/radio-buttons/component";
import RadioButtonsItemComponent from "ui/components/form/radio-buttons-item/component";
import CheckBoxComponent from "ui/components/form/check-box/component";
import FileSelectComponent from "ui/components/form/file-select/component";
import TextFieldComponent from "ui/components/form/text-field/component";
import NumberFieldComponent from "ui/components/form/number-field/component";

import FollowChannelComponent from "ui/components/button/follow-channel/component";
import FollowGameComponent from "ui/components/button/follow-game/component";
import FormButtonComponent from "ui/components/button/form-button/component";
import OpenChatComponent from "ui/components/button/open-chat/component";
import ShareChannelComponent from "ui/components/button/share-channel/component";
import SubscribeChannelComponent from "ui/components/button/subscribe-channel/component";
import TwitchEmotesComponent from "ui/components/button/twitch-emotes/component";

import ModalServiceComponent from "ui/components/modal/modal-service/component";
import ModalBodyComponent from "ui/components/modal/modal-body/component";
import ModalChangelogComponent from "ui/components/modal/modal-changelog/component";
import ModalConfirmComponent from "ui/components/modal/modal-confirm/component";
import ModalFirstrunComponent from "ui/components/modal/modal-firstrun/component";
import ModalFooterComponent from "ui/components/modal/modal-footer/component";
import ModalHeaderComponent from "ui/components/modal/modal-header/component";
import ModalStreamingComponent from "ui/components/modal/modal-streaming/component";
import ModalLogComponent from "ui/components/modal/modal-log/component";
import ModalNewreleaseComponent from "ui/components/modal/modal-newrelease/component";
import ModalQuitComponent from "ui/components/modal/modal-quit/component";

import ContentListComponent from "ui/components/list/content-list/component";
import CommunityItemComponent from "ui/components/list/community-item/component";
import ChannelItemComponent from "ui/components/list/channel-item/component";
import GameItemComponent from "ui/components/list/game-item/component";
import HeadlineTotalsComponent from "ui/components/list/headline-totals/component";
import InfiniteScrollComponent from "ui/components/list/infinite-scroll/component";
import StreamItemComponent from "ui/components/list/stream-item/component";
import SubscriptionItemComponent from "ui/components/list/subscription-item/component";
import TeamItemComponent from "ui/components/list/team-item/component";

import QuickBarComponent from "ui/components/quick/quick-bar/component";
import QuickBarHomepageComponent from "ui/components/quick/quick-bar-homepage/component";
import QuickBarRandomStreamComponent from "ui/components/quick/quick-bar-random-stream/component";

import ChannelPanelsComponent from "ui/components/channel/channel-panels/component";
import ChannelPanelItemComponent from "ui/components/channel/channel-panel-item/component";

import StatsRowComponent from "ui/components/stream/stats-row/component";
import StreamPresentationComponent from "ui/components/stream/stream-presentation/component";
import StreamPreviewImageComponent from "ui/components/stream/stream-preview-image/component";

import FlagIconComponent from "ui/components/flag-icon/component";
import LoadingSpinnerComponent from "ui/components/loading-spinner/component";
import PreviewImageComponent from "ui/components/preview-image/component";
import SearchBarComponent from "ui/components/search-bar/component";
import SelectableTextComponent from "ui/components/selectable-text/component";

import SettingsRowComponent from "ui/components/settings-row/component";
import SettingsChannelItemComponent from "ui/components/list/settings-channel-item/component";
import SettingsSubmitComponent from "ui/components/settings-submit/component";

import FeaturedRoute from "ui/routes/featured/route";
import FeaturedController from "ui/routes/featured/controller";
import FeaturedTemplate from "ui/routes/featured/template.hbs";

import WatchingRoute from "ui/routes/watching/route";
import WatchingController from "ui/routes/watching/controller";
import WatchingTemplate from "ui/routes/watching/template.hbs";

import SearchRoute from "ui/routes/search/route";
import SearchController from "ui/routes/search/controller";
import SearchTemplate from "ui/routes/search/template.hbs";

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

import StreamsRoute from "ui/routes/streams/route";
import StreamsTemplate from "ui/routes/streams/template.hbs";

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

import AboutController from "ui/routes/about/controller";
import AboutTemplate from "ui/routes/about/template.hbs";


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
