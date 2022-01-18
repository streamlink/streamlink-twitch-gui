import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";
import { buildFakeApplication } from "test-utils";
import { adapterRequestFactory, setupStore } from "store-utils";
import { visit } from "@ember/test-helpers";
import sinon from "sinon";

import Router from "@ember/routing/router";
import Service from "@ember/service";

import GamesIndexRoute from "ui/routes/games/index/route";
import GamesIndexRouteFixtures from "fixtures/ui/routes/games/index.yml";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchGame from "data/models/twitch/game/model";
import TwitchGameSerializer from "data/models/twitch/game/serializer";
import TwitchGameTop from "data/models/twitch/game-top/model";
import TwitchGameTopSerializer from "data/models/twitch/game-top/serializer";
import TwitchImageTransform from "data/transforms/twitch/image";


module( "ui/routes/games/index/route", function( hooks ) {
	buildFakeApplication( hooks, {
		Router: Router.extend({
			location: "none"
		}).map(function() {
			this.route( "games", function() {
				this.route( "index" );
			});
		}),

		GamesIndexRoute,
		TwitchGame,
		TwitchGameSerializer,
		TwitchGameTop,
		TwitchGameTopSerializer,
		TwitchImageTransform,

		AuthService: Service.extend({
			session: {
				isLoggedIn: true
			}
		}),
		ModalService: Service.extend(),
		SettingsService: Service.extend()
	});

	setupApplicationTest( hooks );

	/** @typedef {TestContext} TestContextGamesIndexRoute */
	/** @this TestContextGamesIndexRoute */
	hooks.beforeEach(function( assert ) {
		setupStore( this.owner, { adapter: TwitchAdapter } );

		const route = this.owner.lookup( "route:games.index" );

		this.preloadStub = sinon.stub( route, "preload" ).returnsArg( 0 );
		this.calcFetchSizeStub = sinon.stub( route, "calcFetchSize" ).returns( 2 );

		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "twitch-game-top" ).ajax
			= adapterRequestFactory( assert, GamesIndexRouteFixtures );
	});


	/** @this TestContextGamesIndexRoute */
	test( "Pagination", async function( assert ) {
		await visit( "/games/index" );
		const route = this.owner.lookup( "route:games.index" );
		const controller = this.owner.lookup( "controller:games.index" );

		assert.propEqual(
			controller.model.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "1",
					name: "first game",
					box_art_url: "https://mock/twitch-game-top/1/box_art-285x380.png"
				},
				{
					id: "2",
					name: "second game",
					box_art_url: "https://mock/twitch-game-top/2/box_art-285x380.png"
				}
			],
			"Fetches two TwitchGameTop records in the first request"
		);
		assert.notOk( controller.hasFetchedAll, "Is not done fetching after the first request" );
		assert.propEqual(
			this.preloadStub.args.map( args => args.slice( 1 ) ),
			[[ "box_art_url.latest" ]],
			"Preloads images of the first request"
		);

		await route.willFetchContent();
		assert.propEqual(
			controller.model.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "1",
					name: "first game",
					box_art_url: "https://mock/twitch-game-top/1/box_art-285x380.png"
				},
				{
					id: "2",
					name: "second game",
					box_art_url: "https://mock/twitch-game-top/2/box_art-285x380.png"
				},
				{
					id: "3",
					name: "third game",
					box_art_url: "https://mock/twitch-game-top/3/box_art-285x380.png"
				}
			],
			"Fetches the last TwitchGameTop record in the second request"
		);
		assert.ok( controller.hasFetchedAll, "Has fetched all after two requests" );
		assert.propEqual(
			this.preloadStub.args.map( args => args.slice( 1 ) ),
			[ [ "box_art_url.latest" ], [ "box_art_url.latest" ] ],
			"Also preloads images of the second request"
		);
	});
});
