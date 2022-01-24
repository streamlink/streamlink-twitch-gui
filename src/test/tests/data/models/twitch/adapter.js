import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { adapterRequestFactory, setupStore } from "store-utils";
import { FakeIntlService } from "intl-utils";

import Service from "@ember/service";
import Model from "ember-data/model";

import TwitchAdapter from "data/models/twitch/adapter";
import TwitchStream from "data/models/twitch/stream/model";
import TwitchStreamAdapter from "data/models/twitch/stream/adapter";
import TwitchStreamSerializer from "data/models/twitch/stream/serializer";
import TwitchUser from "data/models/twitch/user/model";
import TwitchUserAdapter from "data/models/twitch/user/adapter";
import TwitchUserSerializer from "data/models/twitch/user/serializer";
import TwitchImageTransform from "data/transforms/twitch/image";

import fixturesCoalesceStreamSingle
	from "fixtures/data/models/twitch/adapter/coalesce-stream-single.yml";
import fixturesCoalesceStreamMultiple
	from "fixtures/data/models/twitch/adapter/coalesce-stream-multiple.yml";
import fixturesCoalesceVariousSingle
	from "fixtures/data/models/twitch/adapter/coalesce-various-single.yml";
import fixturesCoalesceVariousMultiple
	from "fixtures/data/models/twitch/adapter/coalesce-various-multiple.yml";


module( "data/models/twitch/adapter", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			IntlService: FakeIntlService,
			SettingsService: Service.extend(),
			TwitchStream,
			TwitchStreamAdapter,
			TwitchStreamSerializer,
			TwitchUser,
			TwitchUserAdapter,
			TwitchUserSerializer,
			TwitchChannel: Model.extend(),
			TwitchGame: Model.extend(),
			TwitchImageTransform
		})
	});

	hooks.beforeEach(function() {
		setupStore( this.owner, { adapter: TwitchAdapter } );
	});


	test( "Coalesced single request with single type", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		const responseStub
			= store.adapterFor( "twitch-stream" ).ajax
			= adapterRequestFactory( assert, fixturesCoalesceStreamSingle );

		await Promise.all([
			store.findRecord( "twitch-stream", "1" ),
			store.findRecord( "twitch-stream", "2" )
		]);

		assert.propEqual(
			store.peekAll( "twitch-stream" ).mapBy( "id" ),
			[ "1", "2" ],
			"Has all TwitchStream records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-user" ).mapBy( "id" ),
			[],
			"Has no TwitchUser records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-game" ).mapBy( "id" ),
			[],
			"Has no TwitchGame records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-channel" ).mapBy( "id" ),
			[],
			"Has no TwitchChannel records registered in the data store"
		);
		assert.strictEqual( responseStub.callCount, 1, "Queries API once" );
	});

	test( "Coalesced multiple requests with single type (URL length)", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		/** @type {TwitchStreamAdapter} */
		const adapter = store.adapterFor( "twitch-stream" );

		const ids = [ "1234567890", "1234567891", "1234567892", "1234567893" ];

		const responseStub
			= adapter.ajax
			= adapterRequestFactory( assert, fixturesCoalesceStreamMultiple );

		// space for two 10 char ids plus separator
		adapter.maxURLLength
			= "https://api.twitch.tv/helix/streams".length
			+ "?user_id=1234567890".length
			+ "&user_id=1234567891".length;

		await Promise.all(
			ids.map( id => store.findRecord( "twitch-stream", id ) )
		);

		assert.propEqual(
			store.peekAll( "twitch-stream" ).mapBy( "id" ),
			ids,
			"Has all TwitchStream records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-user" ).mapBy( "id" ),
			[],
			"Has no TwitchUser records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-game" ).mapBy( "id" ),
			[],
			"Has no TwitchGame records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-channel" ).mapBy( "id" ),
			[],
			"Has no TwitchChannel records registered in the data store"
		);
		assert.strictEqual( responseStub.callCount, 2, "Queries API twice" );
	});

	test( "Coalesced multiple requests with single type (max IDs)", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		/** @type {TwitchStreamAdapter} */
		const adapter = store.adapterFor( "twitch-stream" );

		const ids = [ "1234567890", "1234567891", "1234567892", "1234567893" ];

		const responseStub
			= adapter.ajax
			= adapterRequestFactory( assert, fixturesCoalesceStreamMultiple );

		// space for at most two IDs
		adapter.findIdMax = 2;

		await Promise.all(
			ids.map( id => store.findRecord( "twitch-stream", id ) )
		);

		assert.propEqual(
			store.peekAll( "twitch-stream" ).mapBy( "id" ),
			ids,
			"Has all TwitchStream records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-user" ).mapBy( "id" ),
			[],
			"Has no TwitchUser records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-game" ).mapBy( "id" ),
			[],
			"Has no TwitchGame records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-channel" ).mapBy( "id" ),
			[],
			"Has no TwitchChannel records registered in the data store"
		);
		assert.strictEqual( responseStub.callCount, 2, "Queries API twice" );
	});

	test( "Coalesced single request with multiple types", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		const streamResponseStub
			= store.adapterFor( "twitch-stream" ).ajax
			= adapterRequestFactory( assert, fixturesCoalesceVariousSingle, "stream" );
		const userResponseStub
			= store.adapterFor( "twitch-user" ).ajax
			= adapterRequestFactory( assert, fixturesCoalesceVariousSingle, "user" );

		await Promise.all([
			store.findRecord( "twitch-stream", "1" ),
			store.findRecord( "twitch-stream", "2" ),
			store.findRecord( "twitch-user", "1" ),
			store.findRecord( "twitch-user", "2" )
		]);

		assert.propEqual(
			store.peekAll( "twitch-stream" ).mapBy( "id" ),
			[ "1", "2" ],
			"Has all TwitchStream records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-user" ).mapBy( "id" ),
			[ "1", "2" ],
			"Has all TwitchUser records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-game" ).mapBy( "id" ),
			[],
			"Has no TwitchGame records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-channel" ).mapBy( "id" ),
			[],
			"Has no TwitchChannel records registered in the data store"
		);
		assert.strictEqual( streamResponseStub.callCount, 1, "Queries API once for streams" );
		assert.strictEqual( userResponseStub.callCount, 1, "Queries API once for users" );
	});

	test( "Coalesced multiple requests with multiple types", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		const streamAdapter = store.adapterFor( "twitch-stream" );
		const userAdapter = store.adapterFor( "twitch-user" );

		const streamIds = [ "1234567890", "1234567891", "1234567892", "1234567893" ];
		const userIds = [ "1234567890", "1234567891", "1234567892", "1234567893" ];

		streamAdapter.findIdMax = 2;
		userAdapter.maxURLLength
			= "https://api.twitch.tv/helix/users".length
			+ "?id=1234567890".length
			+ "?id=1234567891".length;

		const streamResponseStub
			= streamAdapter.ajax
			= adapterRequestFactory( assert, fixturesCoalesceVariousMultiple[ "stream" ] );
		const userResponseStub
			= userAdapter.ajax
			= adapterRequestFactory( assert, fixturesCoalesceVariousMultiple[ "user" ] );

		await Promise.all([
			...streamIds.map( id => store.findRecord( "twitch-stream", id ) ),
			...userIds.map( id => store.findRecord( "twitch-user", id ) )
		]);
		assert.propEqual(
			store.peekAll( "twitch-stream" ).mapBy( "id" ),
			streamIds,
			"Has all TwitchStream records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-user" ).mapBy( "id" ),
			userIds,
			"Has all TwitchUser records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-game" ).mapBy( "id" ),
			[],
			"Has no TwitchGame records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-channel" ).mapBy( "id" ),
			[],
			"Has no TwitchChannel records registered in the data store"
		);
		assert.strictEqual( streamResponseStub.callCount, 2, "Queries API twice for streams" );
		assert.strictEqual( userResponseStub.callCount, 2, "Queries API twice for users" );
	});
});
