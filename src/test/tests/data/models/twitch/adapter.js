import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import { FakeI18nService } from "i18n-utils";
import sinon from "sinon";

import Service from "@ember/service";

import TwitchAdapter from "data/models/twitch/adapter";
import TwitchStream from "data/models/twitch/stream/model";
import TwitchStreamAdapter from "data/models/twitch/stream/adapter";
import TwitchStreamSerializer from "data/models/twitch/stream/serializer";
import TwitchChannel from "data/models/twitch/channel/model";
import TwitchChannelSerializer from "data/models/twitch/channel/serializer";
import twitchImageInjector from "inject-loader?config!data/models/twitch/image/model";
import TwitchImageSerializer from "data/models/twitch/image/serializer";
import TwitchUser from "data/models/twitch/user/model";
import TwitchUserAdapter from "data/models/twitch/user/adapter";
import TwitchUserSerializer from "data/models/twitch/user/serializer";
import TwitchAdapterFixtures from "fixtures/data/models/twitch/adapter.json";


module( "data/models/twitch/adapter", function( hooks ) {
	const { default: TwitchImage } = twitchImageInjector({
		config: {
			vars: {}
		}
	});

	setupTest( hooks, {
		resolver: buildResolver({
			AuthService: class extends Service {},
			I18nService: FakeI18nService,
			SettingsService: class extends Service {},
			TwitchStream,
			TwitchStreamAdapter,
			TwitchStreamSerializer,
			TwitchChannel,
			TwitchChannelSerializer,
			TwitchImage,
			TwitchImageSerializer,
			TwitchUser,
			TwitchUserAdapter,
			TwitchUserSerializer
		})
	});

	hooks.beforeEach(function() {
		setupStore( this.owner, { adapter: TwitchAdapter } );
	});


	test( "Coalesced single request with single type", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		const adapter = store.adapterFor( "twitch-stream" );

		const adapterStub = sinon.stub( adapter, "ajax" ).callsFake( ( ...args ) =>
			adapterRequest( assert, TwitchAdapterFixtures[ "coalesce-stream-single" ], ...args )
		);

		await Promise.all([
			store.findRecord( "twitch-stream", 2 ),
			store.findRecord( "twitch-stream", 4 )
		]);
		assert.ok(
			   store.hasRecordForId( "twitch-stream", 2 )
			&& store.hasRecordForId( "twitch-stream", 4 ),
			"Has all Stream records registered in the data store"
		);
		assert.ok(
			   store.hasRecordForId( "twitch-channel", 2 )
			&& store.hasRecordForId( "twitch-channel", 4 ),
			"Has all Channel records registered in the data store"
		);
		assert.ok(
			   store.hasRecordForId( "twitch-image", "stream/preview/2" )
			&& store.hasRecordForId( "twitch-image", "stream/preview/4" ),
			"Has all Image records registered in the data store"
		);
		assert.ok( adapterStub.calledOnce, "Has made only one request" );
	});

	test( "Coalesced multiple requests with single type", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		const adapter = store.adapterFor( "twitch-stream" );

		// baseLength = 45 (space for two 10 char ids plus separator)
		adapter.maxURLLength = 66;

		let req = 0;
		const adapterStub = sinon.stub( adapter, "ajax" ).callsFake( ( ...args ) =>
			adapterRequest(
				assert,
				TwitchAdapterFixtures[ "coalesce-stream-multiple" ][ req++ ],
				...args
			) );

		const ids = [
			"1234567890",
			"1234567891",
			"1234567892",
			"1234567893"
		];
		await Promise.all( ids.map( id => store.findRecord( "twitch-stream", id ) ) );

		assert.ok( adapterStub.calledTwice, "Has made exactly two requests" );
	});

	test( "Coalesced single request with multiple types", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		const streamAdapter = store.adapterFor( "twitch-stream" );
		const userAdapter = store.adapterFor( "twitch-user" );

		const streamAdapterStub = sinon.stub( streamAdapter, "ajax" ).callsFake( ( ...args ) =>
			adapterRequest(
				assert,
				TwitchAdapterFixtures[ "coalesce-various-single" ][ "stream" ],
				...args
			)
		);
		const userAdapterStub = sinon.stub( userAdapter, "ajax" ).callsFake( ( ...args ) =>
			adapterRequest(
				assert,
				TwitchAdapterFixtures[ "coalesce-various-single" ][ "user" ],
				...args
			)
		);

		await Promise.all([
			store.findRecord( "twitch-stream", 2 ),
			store.findRecord( "twitch-stream", 4 ),
			store.findRecord( "twitch-user", "foo" ),
			store.findRecord( "twitch-user", "bar" )
		]);
		assert.ok(
			   store.hasRecordForId( "twitch-stream", 2 )
			&& store.hasRecordForId( "twitch-stream", 4 ),
			"Has all Stream records registered in the data store"
		);
		assert.ok(
			   store.hasRecordForId( "twitch-channel", 2 )
			&& store.hasRecordForId( "twitch-channel", 4 ),
			"Has all Channel records registered in the data store"
		);
		assert.ok(
			   store.hasRecordForId( "twitch-image", "stream/preview/2" )
			&& store.hasRecordForId( "twitch-image", "stream/preview/4" ),
			"Has all Image records registered in the data store"
		);
		assert.ok(
			   store.hasRecordForId( "twitch-user", "foo" )
			&& store.hasRecordForId( "twitch-user", "bar" ),
			"Has all Stream records registered in the data store"
		);
		assert.ok( streamAdapterStub.calledOnce, "Has made only one request for stream" );
		assert.ok( userAdapterStub.calledOnce, "Has made only one request for user" );
	});

	test( "Coalesced multiple requests with multiple types", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		const streamAdapter = store.adapterFor( "twitch-stream" );
		const userAdapter = store.adapterFor( "twitch-user" );

		// baseLength = 45 (space for two 10 char ids plus separator)
		streamAdapter.maxURLLength = 66;
		// baseLength = 41 (space for two 3 char ids plus separator)
		userAdapter.maxURLLength = 48;

		let reqStream = 0;
		let reqUser = 0;

		const streamAdapterStub = sinon.stub( streamAdapter, "ajax" ).callsFake( ( ...args ) =>
			adapterRequest(
				assert,
				TwitchAdapterFixtures[ "coalesce-various-multiple" ][ "stream" ][ reqStream++ ],
				...args
			) );
		const userAdapterStub = sinon.stub( userAdapter, "ajax" ).callsFake( ( ...args ) =>
			adapterRequest(
				assert,
				TwitchAdapterFixtures[ "coalesce-various-multiple" ][ "user" ][ reqUser++ ],
				...args
			) );

		const streamIds = [
			"1234567890",
			"1234567891",
			"1234567892",
			"1234567893"
		];
		const userIds = [
			"foo",
			"bar",
			"baz",
			"qux"
		];

		await Promise.all( [
			...streamIds.map( id => store.findRecord( "twitch-stream", id ) ),
			...userIds.map( id => store.findRecord( "twitch-user", id ) )
		]);

		assert.propEqual(
			store.peekAll( "twitch-stream" ).mapBy( "id" ),
			streamIds,
			"Has all Stream records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-channel" ).mapBy( "id" ),
			streamIds,
			"Has all Channel records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-image" ).mapBy( "id" ),
			streamIds.map( id => `stream/preview/${id}` ),
			"Has all Image records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitchUser" ).mapBy( "id" ),
			userIds,
			"Has all Stream records registered in the data store"
		);
		assert.ok( streamAdapterStub.calledTwice, "Has made two requests for stream" );
		assert.ok( userAdapterStub.calledTwice, "Has made two requests for user" );
	});
});
