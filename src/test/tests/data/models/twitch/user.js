import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import { FakeIntlService } from "intl-utils";

import { get } from "@ember/object";
import Service from "@ember/service";

import TwitchUser from "data/models/twitch/user/model";
import TwitchUserAdapter from "data/models/twitch/user/adapter";
import TwitchUserSerializer from "data/models/twitch/user/serializer";
import TwitchStream from "data/models/twitch/stream/model";
import TwitchStreamSerializer from "data/models/twitch/stream/serializer";
import TwitchChannel from "data/models/twitch/channel/model";
import TwitchChannelSerializer from "data/models/twitch/channel/serializer";
import twitchImageInjector from "inject-loader?config!data/models/twitch/image/model";
import TwitchImageSerializer from "data/models/twitch/image/serializer";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchUserFixtures from "fixtures/data/models/twitch/user.json";
import TwitchChannelFixtures from "fixtures/data/models/twitch/channel.json";
import TwitchStreamFixtures from "fixtures/data/models/twitch/stream.json";


module( "data/models/twitch/user", function( hooks ) {
	const { default: TwitchImage } = twitchImageInjector({
		config: {
			vars: {}
		}
	});

	setupTest( hooks, {
		resolver: buildResolver({
			AuthService: Service.extend(),
			IntlService: FakeIntlService,
			SettingsService: Service.extend(),
			TwitchUser,
			TwitchUserAdapter,
			TwitchUserSerializer,
			TwitchStream,
			TwitchStreamAdapter: TwitchAdapter.extend(),
			TwitchStreamSerializer,
			TwitchChannel,
			TwitchChannelAdapter: TwitchAdapter.extend(),
			TwitchChannelSerializer,
			TwitchImage,
			TwitchImageSerializer
		})
	});

	hooks.beforeEach(function( assert ) {
		const { owner } = this;
		const { store } = setupStore( owner );

		store.adapterFor( "twitch-channel" ).ajax = ( ...args ) =>
			adapterRequest( assert, TwitchChannelFixtures[ "by-id" ], ...args );
		store.adapterFor( "twitch-stream" ).ajax = ( ...args ) =>
			adapterRequest( assert, TwitchStreamFixtures[ "single" ], ...args );
	});


	test( "findRecord", async function( assert ) {
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "twitch-user" ).ajax = ( ...args ) =>
			adapterRequest( assert, TwitchUserFixtures[ "find-record" ], ...args );

		const record = await store.findRecord( "twitch-user", "foo" );

		assert.propEqual(
			record.toJSON({ includeId: true }),
			{
				id: "foo",
				channel: "1",
				stream: "1"
			},
			"Records have the correct id and attributes"
		);
		assert.ok(
			!store.hasRecordForId( "twitch-channel", 1 ),
			"Does not have a channel record registered in the data store"
		);
		assert.ok(
			!store.hasRecordForId( "twitch-stream", 1 ),
			"Does not have a stream record registered in the data store"
		);
		assert.ok(
			!store.hasRecordForId( "twitch-image", "stream/preview/1" ),
			"Does not have an image record registered in the data store"
		);

		await get( record, "channel" );
		assert.ok(
			store.hasRecordForId( "twitch-channel", "1" ),
			"Store does have a channel record registered after accessing the channel"
		);

		await get( record, "stream" );
		assert.ok(
			store.hasRecordForId( "twitch-stream", "1" ),
			"Store does have a stream record registered after accessing the stream"
		);
		assert.ok(
			store.hasRecordForId( "twitch-channel", "1" ),
			"Store does have a channel record registered after accessing the channel"
		);
		assert.ok(
			store.hasRecordForId( "twitch-image", "stream/preview/1" ),
			"Store does have an image record registered after accessing the stream"
		);
	});

	test( "findRecord - coalesced", async function( assert ) {
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "twitch-user" ).ajax = ( ...args ) =>
			adapterRequest( assert, TwitchUserFixtures[ "find-record-coalesced" ], ...args );

		const records = await Promise.all([
			store.findRecord( "twitch-user", "foo" ),
			store.findRecord( "twitch-user", "bar" )
		]);

		assert.propEqual(
			records.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "foo",
					channel: "1",
					stream: "1"
				},
				{
					id: "bar",
					channel: "2",
					stream: "2"
				}
			],
			"Records have the correct id and attributes"
		);
	});

	test( "queryRecord", async function( assert ) {
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "twitch-user" ).ajax = ( ...args ) =>
			adapterRequest( assert, TwitchUserFixtures[ "query-record" ], ...args );

		const record = await store.queryRecord( "twitch-user", "FOO" );

		assert.propEqual(
			record.toJSON({ includeId: true }),
			{
				id: "foo",
				channel: "1",
				stream: "1"
			},
			"Records have the correct id and attributes"
		);
	});
});
