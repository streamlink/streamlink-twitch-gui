import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";
import { buildFakeApplication } from "test-utils";
import { adapterRequestFactory, setupStore } from "store-utils";
import { FakeIntlService } from "intl-utils";
import { visit } from "@ember/test-helpers";
import sinon from "sinon";

import Router from "@ember/routing/router";
import Service from "@ember/service";

import GamesGameRoute from "ui/routes/games/game/route";
import GamesGameRouteFixtures from "fixtures/ui/routes/games/game.yml";
import TwitchStream from "data/models/twitch/stream/model";
import TwitchStreamAdapter from "data/models/twitch/stream/adapter";
import TwitchStreamSerializer from "data/models/twitch/stream/serializer";
import TwitchUser from "data/models/twitch/user/model";
import TwitchUserAdapter from "data/models/twitch/user/adapter";
import TwitchUserSerializer from "data/models/twitch/user/serializer";
import TwitchChannel from "data/models/twitch/channel/model";
import TwitchChannelAdapter from "data/models/twitch/channel/adapter";
import TwitchChannelSerializer from "data/models/twitch/channel/serializer";
import TwitchGame from "data/models/twitch/game/model";
import TwitchGameAdapter from "data/models/twitch/game/adapter";
import TwitchGameSerializer from "data/models/twitch/game/serializer";
import TwitchImageTransform from "data/transforms/twitch/image";


module( "ui/routes/games/game/route", function( hooks ) {
	buildFakeApplication( hooks, {
		Router: Router.extend({
			location: "none"
		}).map(function() {
			this.route( "games", function() {
				this.route( "game", { path: "/:game_id" } );
			});
		}),

		GamesGameRoute,
		TwitchGame,
		TwitchGameAdapter,
		TwitchGameSerializer,
		TwitchStream,
		TwitchStreamAdapter,
		TwitchStreamSerializer,
		TwitchUser,
		TwitchUserAdapter,
		TwitchUserSerializer,
		TwitchChannel,
		TwitchChannelAdapter,
		TwitchChannelSerializer,
		TwitchImageTransform,

		AuthService: Service.extend({
			session: {
				isLoggedIn: true
			}
		}),
		IntlService: FakeIntlService,
		ModalService: Service.extend(),
		SettingsService: Service.extend({
			content: {
				streams: {}
			}
		})
	});

	setupApplicationTest( hooks );

	/** @typedef {TestContext} TestContextGamesGameRoute */
	/** @this TestContextGamesGameRoute */
	hooks.beforeEach(function( assert ) {
		setupStore( this.owner );

		const route = this.owner.lookup( "route:games.game" );

		this.preloadStub = sinon.stub( route, "preload" ).returnsArg( 0 );
		this.calcFetchSizeStub = sinon.stub( route, "calcFetchSize" ).returns( 2 );

		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "twitch-game" ).ajax
			= adapterRequestFactory( assert, GamesGameRouteFixtures, "game" );
		store.adapterFor( "twitch-stream" ).ajax
			= adapterRequestFactory( assert, GamesGameRouteFixtures[ "stream" ] );
		store.adapterFor( "twitch-user" ).ajax
			= adapterRequestFactory( assert, GamesGameRouteFixtures[ "user" ] );
		store.adapterFor( "twitch-channel" ).ajax
			= adapterRequestFactory( assert, GamesGameRouteFixtures[ "channel" ] );
	});


	/** @this TestContextGamesGameRoute */
	test( "Pagination", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		await visit( "/games/123" );
		const route = this.owner.lookup( "route:games.game" );
		const controller = this.owner.lookup( "controller:games.game" );

		assert.propEqual(
			controller.model.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "1",
					user: "1",
					channel: "1",
					game: "123",
					game_id: "123",
					game_name: null,
					is_mature: false,
					language: null,
					started_at: null,
					thumbnail_url: "https://mock/twitch-stream/1/thumbnail_url-640x360.jpg",
					title: null,
					type: null,
					user_login: null,
					user_name: null,
					viewer_count: null
				},
				{
					id: "2",
					user: "2",
					channel: "2",
					game: "123",
					game_id: "123",
					game_name: null,
					is_mature: false,
					language: null,
					started_at: null,
					thumbnail_url: "https://mock/twitch-stream/2/thumbnail_url-640x360.jpg",
					title: null,
					type: null,
					user_login: null,
					user_name: null,
					viewer_count: null
				}
			],
			"Fetches two TwitchStream records in the first request"
		);
		assert.notOk( controller.hasFetchedAll, "Is not done fetching after the first request" );
		assert.propEqual(
			store.peekAll( "twitch-stream" ).mapBy( "id" ),
			[ "1", "2" ],
			"Store has TwitchStream 1 and 2 loaded"
		);
		assert.propEqual(
			store.peekAll( "twitch-user" ).mapBy( "id" ),
			[ "1", "2" ],
			"Store has TwitchUser 1 and 2 loaded"
		);
		assert.propEqual(
			store.peekAll( "twitch-channel" ).mapBy( "id" ),
			[ "1", "2" ],
			"Store has TwitchChannel 1 and 2 loaded"
		);
		assert.propEqual(
			this.preloadStub.args.map( args => args.slice( 1 ) ),
			[[ "thumbnail_url.latest" ]],
			"Preloads images of the first request"
		);

		await route.willFetchContent();
		assert.propEqual(
			controller.model.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "1",
					user: "1",
					channel: "1",
					game: "123",
					game_id: "123",
					game_name: null,
					is_mature: false,
					language: null,
					started_at: null,
					thumbnail_url: "https://mock/twitch-stream/1/thumbnail_url-640x360.jpg",
					title: null,
					type: null,
					user_login: null,
					user_name: null,
					viewer_count: null
				},
				{
					id: "2",
					user: "2",
					channel: "2",
					game: "123",
					game_id: "123",
					game_name: null,
					is_mature: false,
					language: null,
					started_at: null,
					thumbnail_url: "https://mock/twitch-stream/2/thumbnail_url-640x360.jpg",
					title: null,
					type: null,
					user_login: null,
					user_name: null,
					viewer_count: null
				},
				{
					id: "3",
					user: "3",
					channel: "3",
					game: "123",
					game_id: "123",
					game_name: null,
					is_mature: false,
					language: null,
					started_at: null,
					thumbnail_url: "https://mock/twitch-stream/3/thumbnail_url-640x360.jpg",
					title: null,
					type: null,
					user_login: null,
					user_name: null,
					viewer_count: null
				}
			],
			"Fetches the last TwitchStream record in the second request"
		);
		assert.ok( controller.hasFetchedAll, "Has fetched all after two requests" );
		assert.propEqual(
			store.peekAll( "twitch-stream" ).mapBy( "id" ),
			[ "1", "2", "3" ],
			"Store has all TwitchStream records loaded"
		);
		assert.propEqual(
			store.peekAll( "twitch-user" ).mapBy( "id" ),
			[ "1", "2", "3" ],
			"Store has all TwitchUser records loaded"
		);
		assert.propEqual(
			store.peekAll( "twitch-channel" ).mapBy( "id" ),
			[ "1", "2", "3" ],
			"Store has all TwitchChannel records loaded"
		);
		assert.propEqual(
			this.preloadStub.args.map( args => args.slice( 1 ) ),
			[ [ "thumbnail_url.latest" ], [ "thumbnail_url.latest" ] ],
			"Preloads images of the second request"
		);
	});
});
