import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";
import { buildFakeApplication } from "test-utils";
import { setupStore } from "store-utils";
import { visit, currentRouteName } from "@ember/test-helpers";
import sinon from "sinon";

import { get, set } from "@ember/object";
import Route from "@ember/routing/route";
import Router from "@ember/routing/router";
import Service from "@ember/service";
import Adapter from "ember-data/adapter";

// eslint-disable-next-line max-len
import userFollowedStreamsRouteInjector from "inject-loader?../index/route&ui/routes/-mixins/routes/refresh&utils/preload!ui/routes/user/followed-streams/route";
import TwitchStreamFollowed from "data/models/twitch/stream-followed/model";
import TwitchStreamFollowedSerializer from "data/models/twitch/stream-followed/serializer";
import TwitchStream from "data/models/twitch/stream/model";
import TwitchStreamSerializer from "data/models/twitch/stream/serializer";
import TwitchChannel from "data/models/twitch/channel/model";
import TwitchChannelSerializer from "data/models/twitch/channel/serializer";
import TwitchImage from "data/models/twitch/image/model";
import TwitchImageSerializer from "data/models/twitch/image/serializer";


module( "ui/routes/user/followed-streams", function( hooks ) {
	buildFakeApplication( hooks, {
		Router: Router.extend({
			location: "none"
		}).map(function() {
			this.route( "user", function() {
				this.route( "followedStreams" );
			});
		}),

		IntlService: Service.extend(),
		SettingsService: Service.extend(),

		TwitchStreamFollowed,
		TwitchStreamFollowedSerializer,
		TwitchStream,
		TwitchStreamSerializer,
		TwitchChannel,
		TwitchChannelSerializer,
		TwitchImage,
		TwitchImageSerializer
	});

	setupApplicationTest( hooks );

	hooks.beforeEach(function() {
		setupStore( this.owner );

		this.preloadStub = sinon.stub().callsFake( async obj => obj );
		this.queryStub = sinon.stub();
		this.owner.register( "adapter:twitch-stream-followed", Adapter.extend({
			query: this.queryStub
		}) );

		const { default: UserFollowedStreamsRoute } = userFollowedStreamsRouteInjector({
			// don't test the UserIndexRoute
			"../index/route": Route,
			// don't test RefreshRouteMixin
			"ui/routes/-mixins/routes/refresh": {},
			"utils/preload": {
				preload: this.preloadStub
			}
		});
		this.owner.register( "route:user-followed-streams", UserFollowedStreamsRoute.extend({
			// static fetch sizes for testing purposes (API and infinite scroll)
			maxLimit: 3,
			calcFetchSize() {
				set( this, "_limit", 2 );
			}
		}) );
	});


	test( "Offset and limit from cached records", async function( assert ) {
		const createFakeData = ( offset, arr ) => ({
			streams: arr.map( ( viewers, idx ) => ({
				viewers,
				channel: {
					_id: offset + idx
				},
				preview: {}
			}) )
		});
		this.queryStub
			.onCall( 0 ).resolves( createFakeData( 0, [ 9999, 50, 500 ] ) )
			.onCall( 1 ).resolves( createFakeData( 3, [ 1337, 9000, 0 ] ) )
			// emulate a duplicate record ID by setting a lower offset (replace 0 with 1234)
			.onCall( 2 ).resolves( createFakeData( 5, [ 1234, 4321 ] ) );

		await visit( "user/followedStreams" );
		assert.strictEqual( currentRouteName(), "user.followedStreams", "Has entered the route" );

		const route = this.owner.lookup( "route:user-followed-streams" );
		const controller = this.owner.lookup( "controller:user-followed-streams" );

		assert.propEqual(
			this.queryStub.getCalls().map( call => call.lastArg ),
			[
				{ offset: 0, limit: 3 },
				{ offset: 3, limit: 3 },
				{ offset: 6, limit: 3 }
			],
			"API was queried 3 times with correct query parameters"
		);
		assert.propEqual(
			route.all.map( record => get( record, "viewers" ) ),
			[ 9999, 9000, 4321, 1337, 1234, 500, 50 ],
			"Route has buffered all 7 records, sorted by viewers"
		);
		assert.ok( this.preloadStub.calledOnce, "Has only preloaded preview images once" );
		assert.propEqual(
			controller.model.map( record => get( record, "viewers" ) ),
			[ 9999, 9000 ],
			"Controller model only has 2 records"
		);
		assert.notOk( controller.hasFetchedAll, "Controller hasn't fetched all records yet" );

		this.queryStub.resetHistory();

		await route.willFetchContent( true );
		assert.notOk( this.queryStub.called, "Doesn't query API on infinite scroll" );
		assert.ok( this.preloadStub.calledTwice, "Has preloaded preview images twice now" );
		assert.propEqual(
			controller.model.map( record => get( record, "viewers" ) ),
			[ 9999, 9000, 4321, 1337 ],
			"Controller model now has 4 records"
		);
		assert.notOk( controller.hasFetchedAll, "Controller hasn't fetched all records yet" );

		await route.willFetchContent( true );
		await route.willFetchContent( true );
		assert.propEqual(
			controller.model.map( record => get( record, "viewers" ) ),
			[ 9999, 9000, 4321, 1337, 1234, 500, 50 ],
			"Controller model now has all records"
		);
		assert.ok( controller.hasFetchedAll, "Controller has fetched all records now" );

		await visit( "/" );
		assert.strictEqual( currentRouteName(), "index", "Has left the route" );
		assert.strictEqual( route.all, null, "Unsets cached records" );
	});
});
