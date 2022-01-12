import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { adapterRequestFactory, assertRelationships, setupStore } from "store-utils";
import { FakeIntlService } from "intl-utils";
import sinon from "sinon";

import { set } from "@ember/object";
import Service from "@ember/service";
import Adapter from "ember-data/adapter";
import attr from "ember-data/attr";
import Model from "ember-data/model";

import TwitchStream from "data/models/twitch/stream/model";
import TwitchStreamAdapter from "data/models/twitch/stream/adapter";
import TwitchStreamSerializer from "data/models/twitch/stream/serializer";
import TwitchStreamFixtures from "fixtures/data/models/twitch/stream.yml";
import TwitchUser from "data/models/twitch/user/model";
import TwitchUserAdapter from "data/models/twitch/user/adapter";
import TwitchUserSerializer from "data/models/twitch/user/serializer";
import TwitchChannel from "data/models/twitch/channel/model";
import TwitchChannelAdapter from "data/models/twitch/channel/adapter";
import TwitchChannelSerializer from "data/models/twitch/channel/serializer";
import TwitchGame from "data/models/twitch/game/model";
import TwitchGameAdapter from "data/models/twitch/game/adapter";
import TwitchGameSerializer from "data/models/twitch/game/serializer";


module( "data/models/twitch/stream", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			IntlService: FakeIntlService,
			SettingsService: Service.extend({
				content: {
					streams: {
						vodcast_regexp: ""
					}
				}
			}),
			TwitchStream,
			TwitchStreamAdapter,
			TwitchStreamSerializer,
			TwitchUser,
			TwitchUserAdapter,
			TwitchUserSerializer,
			TwitchChannel,
			TwitchChannelAdapter,
			TwitchChannelSerializer,
			TwitchGame,
			TwitchGameAdapter,
			TwitchGameSerializer
		})
	});

	hooks.beforeEach(function() {
		this.fakeTimer = sinon.useFakeTimers({
			toFake: [ "Date" ],
			global: window
		});

		setupStore( this.owner );
	});

	hooks.afterEach(function() {
		this.fakeTimer.restore();
	});


	test( "Model relationships", function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		/** @type {TwitchStream} */
		const model = store.modelFor( "twitch-stream" );

		assertRelationships( assert, model, [
			{
				key: "user",
				kind: "belongsTo",
				type: "twitch-user",
				options: { async: true }
			},
			{
				key: "channel",
				kind: "belongsTo",
				type: "twitch-channel",
				options: { async: true }
			},
			{
				key: "game",
				kind: "belongsTo",
				type: "twitch-game",
				options: { async: true }
			}
		]);
	});

	test( "Computed properties - vodcast", function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		/** @type {TwitchStream} */
		const record = store.createRecord( "twitch-stream", {} );

		assert.ok( record.reVodcast instanceof RegExp, "Has a default vodcast RegExp" );

		set( record, "settings.content.streams.vodcast_regexp", " " );
		assert.strictEqual( record.reVodcast, null, "Returns null on empty RegExp" );

		set( record, "settings.content.streams.vodcast_regexp", "(" );
		assert.strictEqual( record.reVodcast, null, "Returns null on invalid RegExp" );

		set( record, "settings.content.streams.vodcast_regexp", "I'm a vodcast" );
		assert.ok( record.reVodcast.test( "I'M A VODCAST" ), "Has a custom vodcast RegExp" );

		assert.notOk( record.isVodcast, "Not a vodcast" );

		set( record, "title", "I'm a vodcast" );
		assert.ok( record.isVodcast, "Is a vodcast because of its title" );
	});

	test( "Computed properties - i18n", function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		/** @type {TwitchStream} */
		const record = store.createRecord( "twitch-stream", {} );

		const day = 3600 * 24 * 1000;
		this.fakeTimer.setSystemTime( 2 * day );

		set( record, "started_at", new Date( Date.now() - 1 ) );
		assert.strictEqual(
			record.titleStartedAt,
			"models.twitch.stream.started-at.less-than-24h"
			+ "{\"started_at\":\"1970-01-02T23:59:59.999Z\"}",
			"Shows a shorthand title for streams running for less than 24h"
		);

		set( record, "started_at", new Date( Date.now() - day ) );
		assert.strictEqual(
			record.titleStartedAt,
			"models.twitch.stream.started-at.more-than-24h"
			+ "{\"started_at\":\"1970-01-02T00:00:00.000Z\"}",
			"Shows an extended title for streams running for more than 24h"
		);

		set( record, "viewer_count", 1 );
		assert.strictEqual(
			record.titleViewers,
			"models.twitch.stream.viewer_count{\"count\":1}",
			"Shows the correct title when one person is watching"
		);

		set( record, "viewer_count", 2 );
		assert.strictEqual(
			record.titleViewers,
			"models.twitch.stream.viewer_count{\"count\":2}",
			"Shows the correct title when more than one person is watching"
		);
	});

	test( "Computed properties - language", function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		/** @type {TwitchChannel} */
		const channel = store.createRecord( "twitch-channel", { broadcaster_language: "en" } );
		/** @type {TwitchStream} */
		const stream = store.createRecord( "twitch-stream", { channel } );

		assert.notOk(
			stream.hasLanguage,
			"Does not have a language when attribute is missing"
		);

		set( stream, "language", "other" );
		assert.notOk(
			stream.hasLanguage,
			"Does not have a language when the value of the language attribute is 'other'"
		);

		set( stream, "language", "en" );
		assert.ok(
			stream.hasLanguage,
			"Does have a language when the value of the language attribute is not 'other'"
		);

		assert.notOk(
			stream.hasBroadcasterLanguage,
			"Does not have a broadcaster language when attribute is missing"
		);

		set( channel, "broadcaster_language", "en" );
		assert.notOk(
			stream.hasBroadcasterLanguage,
			"Does not have a broadcaster language when both attributes are equal"
		);

		set( channel, "broadcaster_language", "en-gb" );
		assert.notOk(
			stream.hasBroadcasterLanguage,
			"Does not have a broadcaster language when both main languages are equal"
		);

		set( stream, "language", "en-us" );
		assert.notOk(
			stream.hasBroadcasterLanguage,
			"Does not have a broadcaster language when both main languages are equal"
		);

		set( channel, "broadcaster_language", "de" );
		assert.ok(
			stream.hasBroadcasterLanguage,
			"Does have a broadcaster language when both languages differ"
		);
	});

	test( "queryRecord", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		const streamResponseStub
			= store.adapterFor( "twitch-stream" ).ajax
			= adapterRequestFactory( assert, TwitchStreamFixtures, "queryRecord.stream" );
		const userResponseStub
			= store.adapterFor( "twitch-user" ).ajax
			= adapterRequestFactory( assert, TwitchStreamFixtures, "queryRecord.user" );
		const channelResponseStub
			= store.adapterFor( "twitch-channel" ).ajax
			= adapterRequestFactory( assert, TwitchStreamFixtures, "queryRecord.channel" );
		const gameResponseStub
			= store.adapterFor( "twitch-game" ).ajax
			= adapterRequestFactory( assert, TwitchStreamFixtures, "queryRecord.game" );

		const record = await store.queryRecord( "twitch-stream", { user_id: "123" } );

		assert.propEqual(
			record.toJSON({ includeId: true }),
			{
				id: "123",
				user: "123",
				user_login: "foo",
				user_name: "FOO",
				channel: "123",
				game: "321",
				game_id: "321",
				game_name: "some game",
				type: "live",
				title: "some stream title",
				viewer_count: 1337,
				started_at: "2000-01-01T00:00:00.000Z",
				language: "en",
				thumbnail_url: "https://mock/twitch-stream/1/thumbnail-{width}x{height}.jpg",
				is_mature: true
			},
			"Record has the correct ID and attributes"
		);
		assert.propEqual(
			store.peekAll( "twitch-stream" ).mapBy( "id" ),
			[ "123" ],
			"Has the TwitchStream record registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-user" ).mapBy( "id" ),
			[],
			"Has no TwitchUser record registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-game" ).mapBy( "id" ),
			[],
			"Has no TwitchGame record registered in the data store"
		);
		assert.strictEqual( streamResponseStub.callCount, 1, "Queries API once for streams" );
		assert.strictEqual( userResponseStub.callCount, 0, "Hasn't queried API for user" );
		assert.strictEqual( channelResponseStub.callCount, 0, "Hasn't queried API for channel" );
		assert.strictEqual( gameResponseStub.callCount, 0, "Hasn't queried API for game" );

		await record.user.promise;
		assert.propEqual(
			store.peekAll( "twitch-user" ).mapBy( "id" ),
			[ "123" ],
			"Has the TwitchUser record registered in the data store"
		);
		assert.strictEqual( userResponseStub.callCount, 1, "Has queried API for user" );

		await record.channel.promise;
		assert.propEqual(
			store.peekAll( "twitch-channel" ).mapBy( "id" ),
			[ "123" ],
			"Has the TwitchChannel record registered in the data store"
		);
		assert.strictEqual( channelResponseStub.callCount, 1, "Has queried API for channel" );

		await record.game.promise;
		assert.propEqual(
			store.peekAll( "twitch-game" ).mapBy( "id" ),
			[ "321" ],
			"Has the TwitchGame record registered in the data store"
		);
		assert.strictEqual( gameResponseStub.callCount, 1, "Has queried API for game" );
	});

	test( "query", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "twitch-stream" ).ajax
			= adapterRequestFactory( assert, TwitchStreamFixtures, "query" );

		const records = await store.query( "twitch-stream", { game: "123", language: "en" } );

		assert.propEqual(
			records.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "1",
					user: "1",
					user_login: null,
					user_name: null,
					channel: "1",
					game: "123",
					game_id: "123",
					game_name: null,
					type: null,
					title: null,
					viewer_count: null,
					started_at: null,
					language: null,
					thumbnail_url: null,
					is_mature: false
				},
				{
					id: "2",
					user: "2",
					user_login: null,
					user_name: null,
					channel: "2",
					game: "123",
					game_id: "123",
					game_name: null,
					type: null,
					title: null,
					viewer_count: null,
					started_at: null,
					language: null,
					thumbnail_url: null,
					is_mature: false
				}
			],
			"Records have the correct IDs and attributes"
		);
		assert.propEqual(
			store.peekAll( "twitch-stream" ).mapBy( "id" ),
			[ "1", "2" ],
			"Has all TwitchStream records registered in the data store"
		);
	});

	test( "reload", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		const responseStub
			= store.adapterFor( "twitch-stream" ).ajax
			= adapterRequestFactory( assert, TwitchStreamFixtures[ "reload" ] );

		/** @type {TwitchStream|DS.Model} */
		const record = await store.findRecord( "twitch-stream", "1" );
		assert.propEqual(
			store.peekAll( "twitch-stream" ).mapBy( "id" ),
			[ "1" ],
			"Has the TwitchStream record registered in the data store"
		);
		assert.strictEqual( record.title, "foo", "Title is foo" );
		assert.strictEqual( responseStub.callCount, 1, "Queries API once" );

		await record.reload();
		assert.strictEqual( record.title, "bar", "Title is bar" );
		assert.strictEqual( responseStub.callCount, 2, "Queries API twice" );
	});

	test( "getChannelSettings", async function( assert ) {
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

		store.adapterFor( "twitch-stream" ).ajax
			= adapterRequestFactory( assert, TwitchStreamFixtures, "getChannelSettings" );
		const twitchUserAdapterAjaxStub
			= sinon.stub( store.adapterFor( "twitch-user" ), "ajax" ) .rejects();

		// noinspection JSValidateTypes
		/** @type {TwitchStream} */
		const stream = await store.queryRecord( "twitch-stream", { user_id: "1" } );

		assert.propEqual(
			await stream.getChannelSettings(),
			{ foo: "foo" },
			"Returns channel-settings data"
		);
		assert.propEqual(
			store.peekAll( "channel-settings" ).mapBy( "id" ),
			[],
			"No channel-settings loaded"
		);
		assert.notOk( twitchUserAdapterAjaxStub.called, "Doesn't query API for user" );

		channelSettingsFindRecordStub.rejects();

		assert.propEqual(
			await stream.getChannelSettings(),
			{ foo: null },
			"Returns empty channel-settings data"
		);
		assert.propEqual(
			store.peekAll( "channel-settings" ).mapBy( "id" ),
			[],
			"No channel-settings loaded"
		);
		assert.notOk( twitchUserAdapterAjaxStub.called, "Doesn't query API for user" );
	});
});
