import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { adapterRequestFactory, assertRelationships, setupStore } from "store-utils";
import { FakeIntlService } from "intl-utils";
import sinon from "sinon";

import { set } from "@ember/object";
import Service from "@ember/service";
import attr from "ember-data/attr";
import Adapter from "ember-data/adapter";
import Model from "ember-data/model";

import TwitchUser from "data/models/twitch/user/model";
import TwitchUserAdapter from "data/models/twitch/user/adapter";
import TwitchUserSerializer from "data/models/twitch/user/serializer";
import TwitchUserFixtures from "fixtures/data/models/twitch/user.yml";
import TwitchChannel from "data/models/twitch/channel/model";
import TwitchChannelAdapter from "data/models/twitch/channel/adapter";
import TwitchChannelSerializer from "data/models/twitch/channel/serializer";
import TwitchStream from "data/models/twitch/stream/model";
import TwitchStreamAdapter from "data/models/twitch/stream/adapter";
import TwitchStreamSerializer from "data/models/twitch/stream/serializer";
import TwitchGame from "data/models/twitch/game/model";
import TwitchImageTransform from "data/transforms/twitch/image";
import {
	ATTR_STREAMS_NAME_CUSTOM,
	ATTR_STREAMS_NAME_ORIGINAL,
	ATTR_STREAMS_NAME_BOTH
} from "data/models/settings/streams/fragment";


module( "data/models/twitch/user", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			AuthService: Service.extend(),
			IntlService: FakeIntlService,
			SettingsService: Service.extend({
				content: {
					streams: {
						name: null
					}
				}
			}),
			TwitchUser,
			TwitchUserAdapter,
			TwitchUserSerializer,
			TwitchChannel,
			TwitchChannelAdapter,
			TwitchChannelSerializer,
			TwitchStream,
			TwitchStreamAdapter,
			TwitchStreamSerializer,
			TwitchGame,
			TwitchImageTransform
		})
	});

	hooks.beforeEach(function() {
		setupStore( this.owner );
	});


	test( "Model relationships", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		/** @type {TwitchChannel} */
		const model = store.modelFor( "twitch-user" );

		assertRelationships( assert, model, [
			{
				key: "channel",
				kind: "belongsTo",
				type: "twitch-channel",
				options: { async: true }
			},
			{
				key: "stream",
				kind: "belongsTo",
				type: "twitch-stream",
				options: { async: true, inverse: null }
			}
		]);
	});

	test( "Computed properties", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		/** @type {SettingsService} */
		const settingsService = this.owner.lookup( "service:settings" );

		/** @type {TwitchUser} */
		const record = store.createRecord( "twitch-user", {
			id: 1,
			login: "foo",
			display_name: "foo",
			broadcaster_type: ""
		});

		assert.notOk( record.hasCustomDisplayName, "Has no custom display name" );
		assert.strictEqual( record.detailedName, "foo", "Simple detailedName" );

		set( record, "display_name", "FOO" );
		assert.notOk( record.hasCustomDisplayName, "Still has no custom display name" );
		assert.strictEqual( record.detailedName, "FOO", "Shows display_name as detailedName" );

		set( record, "display_name", "bar" );
		assert.ok( record.hasCustomDisplayName, "Has a custom display name now" );
		assert.strictEqual( record.detailedName, "bar", "Shows custom name" );

		set( settingsService, "content.streams.name", ATTR_STREAMS_NAME_BOTH );
		assert.strictEqual( record.detailedName, "bar (foo)", "Shows both names" );

		set( settingsService, "content.streams.name", ATTR_STREAMS_NAME_CUSTOM );
		assert.strictEqual( record.detailedName, "bar", "Only shows custom name" );

		set( settingsService, "content.streams.name", ATTR_STREAMS_NAME_ORIGINAL );
		assert.strictEqual( record.detailedName, "foo", "Only shows original name" );

		assert.notOk( record.isPartner, "Is not a partnered user" );
		set( record, "broadcaster_type", "partner" );
		assert.ok( record.isPartner, "Is a partnered user now" );
		set( record, "broadcaster_type", "invalid" );
		assert.notOk( record.isPartner, "Invalid broadcaster types are not considered partners" );
		set( record, "broadcaster_type", "affiliate" );
		assert.ok( record.isPartner, "Twitch affiliates are considered partners" );
	});

	test( "findRecord", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "twitch-user" ).ajax
			= adapterRequestFactory( assert, TwitchUserFixtures, "find-record" );

		const record = await store.findRecord( "twitch-user", "1" );

		assert.propEqual(
			record.toJSON({ includeId: true }),
			{
				id: "1",
				channel: "1",
				stream: "1",
				broadcaster_type: "partner",
				description: "channel description",
				display_name: "Foo",
				login: "foo",
				offline_image_url: "https://mock/twitch-user/1/offline_image-1920x1080.png",
				profile_image_url: "https://mock/twitch-user/1/profile_image-300x300.png",
				type: "",
				created_at: "2000-01-01T00:00:00.000Z"
			},
			"Records have the correct IDs and relationship IDs"
		);
		assert.propEqual(
			store.peekAll( "twitch-channel" ).mapBy( "id" ),
			[],
			"No TwitchChannel record registered in the data store"
		);
	});

	test( "findRecord - coalesced", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		const userResponseStub
			= store.adapterFor( "twitch-user" ).ajax
			= adapterRequestFactory( assert, TwitchUserFixtures, "find-record-coalesced.user" );
		const channelResponseStub
			= store.adapterFor( "twitch-channel" ).ajax
			= adapterRequestFactory( assert, TwitchUserFixtures, "find-record-coalesced.channel" );
		const streamResponseStub
			= store.adapterFor( "twitch-stream" ).ajax
			= adapterRequestFactory( assert, TwitchUserFixtures, "find-record-coalesced.stream" );

		const records = await Promise.all([
			store.findRecord( "twitch-user", "1" ),
			store.findRecord( "twitch-user", "2" )
		]);

		assert.propEqual(
			records.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "1",
					channel: "1",
					stream: "1",
					broadcaster_type: null,
					description: null,
					display_name: null,
					login: null,
					offline_image_url: null,
					profile_image_url: null,
					type: null,
					created_at: null
				},
				{
					id: "2",
					channel: "2",
					stream: "2",
					broadcaster_type: null,
					description: null,
					display_name: null,
					login: null,
					offline_image_url: null,
					profile_image_url: null,
					type: null,
					created_at: null
				}
			],
			"Records have the correct IDs and relationship IDs"
		);
		assert.strictEqual(
			userResponseStub.callCount,
			1,
			"Queries API for user data once"
		);
		assert.strictEqual(
			channelResponseStub.callCount,
			0,
			"Has not queried channel API endpoints yet"
		);

		const channelData = await Promise.all(
			records.map( async record => ({
				id: record.id,
				channel: ( await record.channel ).toJSON({ includeId: true })
			}) )
		);

		assert.propEqual(
			channelData,
			[
				{
					id: "1",
					channel: {
						id: "1",
						broadcaster_language: null,
						delay: null
					}
				},
				{
					id: "2",
					channel: {
						id: "2",
						broadcaster_language: null,
						delay: null
					}
				}
			],
			"Correctly finds channel relationship data when accessing it"
		);
		assert.strictEqual(
			channelResponseStub.callCount,
			1,
			"Queries channel API endpoints once"
		);

		const streamData = await Promise.all(
			records.map( async record => ({
				id: record.id,
				stream: ( await record.stream ).toJSON({ includeId: true })
			}) )
		);

		assert.propEqual(
			streamData,
			[
				{
					id: "1",
					stream: {
						id: "1",
						user: "1",
						user_login: null,
						user_name: null,
						channel: "1",
						game: null,
						game_id: null,
						game_name: null,
						type: null,
						title: null,
						viewer_count: null,
						started_at: null,
						language: null,
						thumbnail_url: null,
						is_mature: false
					}
				},
				{
					id: "2",
					stream: {
						id: "2",
						user: "2",
						user_login: null,
						user_name: null,
						channel: "2",
						game: null,
						game_id: null,
						game_name: null,
						type: null,
						title: null,
						viewer_count: null,
						started_at: null,
						language: null,
						thumbnail_url: null,
						is_mature: false
					}
				}
			],
			"Correctly finds stream relationship data when accessing it"
		);
		assert.strictEqual(
			streamResponseStub.callCount,
			1,
			"Queries stream API endpoints once"
		);
	});

	test( "queryRecord", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "twitch-user" ).ajax
			= adapterRequestFactory( assert, TwitchUserFixtures, "query-record" );

		const record = await store.queryRecord( "twitch-user", "FOO" );

		assert.propEqual(
			record.toJSON({ includeId: true }),
			{
				id: "1",
				channel: "1",
				stream: "1",
				broadcaster_type: null,
				description: null,
				display_name: null,
				login: "foo",
				offline_image_url: null,
				profile_image_url: null,
				type: null,
				created_at: null
			},
			"Records have the correct IDs and relationship IDs"
		);
	});

	test( "getChannelSettings", async function( assert) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		const channelSettingsFindRecordStub = sinon.stub()
			.callsFake( async ( store, type, id ) => ({ id, foo: "foo" }));
		this.owner.register( "model:channel-settings", Model.extend({
			foo: attr( "string" )
		}) );
		this.owner.register( "adapter:channel-settings", Adapter.extend({
			findRecord: channelSettingsFindRecordStub
		}) );

		/** @type {TwitchUser} */
		const user = store.createRecord( "twitch-user", { id: "123" } );

		assert.propEqual(
			await user.getChannelSettings(),
			{ foo: "foo" },
			"Returns channel-settings data"
		);
		assert.propEqual(
			store.peekAll( "channel-settings" ).toArray(),
			[],
			"No channel-settings loaded"
		);

		channelSettingsFindRecordStub.rejects();

		assert.propEqual(
			await user.getChannelSettings(),
			{ foo: null },
			"Returns empty channel-settings data"
		);
		assert.propEqual(
			store.peekAll( "channel-settings" ).toArray(),
			[],
			"No channel-settings loaded"
		);
	});
});
