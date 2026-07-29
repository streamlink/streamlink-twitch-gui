import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";
import { buildFakeApplication } from "test-utils";
import { adapterRequestFactory, setupStore } from "store-utils";
import { FakeIntlService } from "intl-utils";
import { visit } from "@ember/test-helpers";
import sinon from "sinon";

import Router from "@ember/routing/router";
import Service from "@ember/service";

import UserFollowedChannelsRoute from "ui/routes/user/followed-channels/route";
import UserFollowedChannelsRouteFixtures from "fixtures/ui/routes/user/followed-channels.yml";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchChannelsFollowed from "data/models/twitch/channels-followed/model";
import TwitchChannelsFollowedAdapter from "data/models/twitch/channels-followed/adapter";
import TwitchChannelsFollowedSerializer from "data/models/twitch/channels-followed/serializer";
import TwitchUser from "data/models/twitch/user/model";
import TwitchUserAdapter from "data/models/twitch/user/adapter";
import TwitchUserSerializer from "data/models/twitch/user/serializer";
import TwitchChannel from "data/models/twitch/channel/model";
import TwitchChannelAdapter from "data/models/twitch/channel/adapter";
import TwitchChannelSerializer from "data/models/twitch/channel/serializer";
import TwitchStream from "data/models/twitch/stream/model";
import TwitchStreamAdapter from "data/models/twitch/stream/adapter";
import TwitchStreamSerializer from "data/models/twitch/stream/serializer";
import TwitchImageTransform from "data/transforms/twitch/image";


module( "ui/routes/user/followed-channels/route", function( hooks ) {
	buildFakeApplication( hooks, {
		Router: Router.extend({
			location: "none"
		}).map(function() {
			this.route( "user", function() {
				this.route( "followed-channels" );
			});
		}),

		UserFollowedChannelsRoute,
		TwitchChannelsFollowed,
		TwitchChannelsFollowedAdapter,
		TwitchChannelsFollowedSerializer,
		TwitchUser,
		TwitchUserAdapter,
		TwitchUserSerializer,
		TwitchChannel,
		TwitchChannelAdapter,
		TwitchChannelSerializer,
		TwitchStream,
		TwitchStreamAdapter,
		TwitchStreamSerializer,
		TwitchImageTransform,

		AuthService: Service.extend({
			session: {
				isLoggedIn: true,
				user_id: "123"
			}
		}),
		IntlService: FakeIntlService,
		ModalService: Service.extend(),
		SettingsService: Service.extend()
	});

	setupApplicationTest( hooks );

	/** @typedef {TestContext} TestContextGamesGameRoute */
	/** @this TestContextGamesGameRoute */
	hooks.beforeEach(function( assert ) {
		setupStore( this.owner, { adapter: TwitchAdapter } );

		const route = this.owner.lookup( "route:user.followed-channels" );

		this.preloadStub = sinon.stub( route, "preload" ).returnsArg( 0 );
		this.calcFetchSizeStub = sinon.stub( route, "calcFetchSize" ).returns( 2 );

		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "twitch-channels-followed" ).ajax
			= adapterRequestFactory( assert, UserFollowedChannelsRouteFixtures[ "user-followed" ] );
		store.adapterFor( "twitch-user" ).ajax
			= adapterRequestFactory( assert, UserFollowedChannelsRouteFixtures[ "user" ] );
		store.adapterFor( "twitch-channel" ).ajax
			= adapterRequestFactory( assert, UserFollowedChannelsRouteFixtures[ "channel" ] );
		store.adapterFor( "twitch-stream" ).ajax
			= adapterRequestFactory( assert, UserFollowedChannelsRouteFixtures[ "stream" ] );
	});


	/** @this TestContextGamesGameRoute */
	test( "Pagination", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		await visit( "/user/followed-channels" );
		const route = this.owner.lookup( "route:user.followed-channels" );
		const controller = this.owner.lookup( "controller:user.followed-channels" );

		assert.propEqual(
			controller.model.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "123-1",
					user_id: "123",
					broadcaster_id: "1",
					followed_at: "2000-01-01T00:00:01.000Z"
				},
				{
					id: "123-2",
					user_id: "123",
					broadcaster_id: "2",
					followed_at: "2000-01-01T00:00:02.000Z"
				}
			],
			"Records have the correct IDs and relationship IDs in the first request"
		);
		assert.notOk( controller.hasFetchedAll, "Is not done fetching after the first request" );
		assert.propEqual(
			store.peekAll( "twitch-channels-followed" ).mapBy( "id" ),
			[ "123-1", "123-2" ],
			"Store has TwitchChannelsFollowed 123-1 and 123-2 loaded"
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
			store.peekAll( "twitch-stream" ).mapBy( "id" ),
			[ "1", "2" ],
			"Store has TwitchStream 1 and 2 loaded"
		);
		assert.propEqual(
			this.preloadStub.args.map( args => args.slice( 1 ) ),
			[[ "profile_image_url" ]],
			"Preloads images of the first request"
		);

		await route.willFetchContent();
		assert.propEqual(
			controller.model.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "123-1",
					user_id: "123",
					broadcaster_id: "1",
					followed_at: "2000-01-01T00:00:01.000Z"
				},
				{
					id: "123-2",
					user_id: "123",
					broadcaster_id: "2",
					followed_at: "2000-01-01T00:00:02.000Z"
				},
				{
					id: "123-3",
					user_id: "123",
					broadcaster_id: "3",
					followed_at: "2000-01-01T00:00:03.000Z"
				}
			],
			"Records have the correct IDs and relationship IDs after two requests"
		);
		assert.ok( controller.hasFetchedAll, "Has fetched all after two requests" );
		assert.propEqual(
			store.peekAll( "twitch-channels-followed" ).mapBy( "id" ),
			[ "123-1", "123-2", "123-3" ],
			"Store has all TwitchChannelsFollowed records loaded"
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
			store.peekAll( "twitch-stream" ).mapBy( "id" ),
			[ "1", "2", "3" ],
			"Store has all TwitchStream records loaded"
		);
		assert.propEqual(
			this.preloadStub.args.map( args => args.slice( 1 ) ),
			[ [ "profile_image_url" ], [ "profile_image_url" ] ],
			"Preloads images of the second request"
		);
	});
});
