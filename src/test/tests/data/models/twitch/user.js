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
			TwitchChannelSerializer
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
			view_count: 1234,
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

		assert.strictEqual(
			record.titleViewCount,
			"models.twitch.user.view_count{\"count\":1234}",
			"titleViewCount has correct translation"
		);
		set( record, "view_count", 1337 );
		assert.strictEqual(
			record.titleViewCount,
			"models.twitch.user.view_count{\"count\":1337}",
			"Updates titleViewCount count parameter"
		);

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
				broadcaster_type: "partner",
				description: "channel description",
				display_name: "Foo",
				login: "foo",
				offline_image_url: "https://mock/twitch-user/1/offline_image-1920x1080.png",
				profile_image_url: "https://mock/twitch-user/1/profile_image-300x300.png",
				type: "",
				view_count: 1234,
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
					broadcaster_type: null,
					description: null,
					display_name: null,
					login: null,
					offline_image_url: null,
					profile_image_url: null,
					type: null,
					view_count: null,
					created_at: null
				},
				{
					id: "2",
					channel: "2",
					broadcaster_type: null,
					description: null,
					display_name: null,
					login: null,
					offline_image_url: null,
					profile_image_url: null,
					type: null,
					view_count: null,
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
				broadcaster_type: null,
				description: null,
				display_name: null,
				login: "foo",
				offline_image_url: null,
				profile_image_url: null,
				type: null,
				view_count: null,
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
