import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { adapterRequestFactory, assertRelationships, setupStore } from "store-utils";
import { FakeIntlService } from "intl-utils";
import sinon from "sinon";

import { set } from "@ember/object";
import Service from "@ember/service";

import Model from "ember-data/model";

import TwitchAdapter from "data/models/twitch/adapter";
import TwitchSearchChannel from "data/models/twitch/search-channel/model";
import TwitchSearchChannelSerializer from "data/models/twitch/search-channel/serializer";
import TwitchSearchChannelFixtures from "fixtures/data/models/twitch/search-channel.yml";
import TwitchUser from "data/models/twitch/user/model";
import TwitchUserAdapter from "data/models/twitch/user/adapter";
import TwitchUserSerializer from "data/models/twitch/user/serializer";
import TwitchGame from "data/models/twitch/game/model";
import TwitchGameAdapter from "data/models/twitch/game/adapter";
import TwitchGameSerializer from "data/models/twitch/game/serializer";
import TwitchImageTransform from "data/transforms/twitch/image";


module( "data/models/twitch/search-channel", function( hooks ) {
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
			TwitchSearchChannel,
			TwitchSearchChannelSerializer,
			TwitchUser,
			TwitchUserAdapter,
			TwitchUserSerializer,
			TwitchStream: Model.extend(),
			TwitchGame,
			TwitchGameAdapter,
			TwitchGameSerializer,
			TwitchChannel: Model.extend(),
			TwitchImageTransform
		})
	});

	hooks.beforeEach(function() {
		this.fakeTimer = sinon.useFakeTimers({
			toFake: [ "Date" ],
			global: window
		});

		setupStore( this.owner, { adapter: TwitchAdapter } );
	});

	hooks.afterEach(function() {
		this.fakeTimer.restore();
	});


	test( "Module relationships", function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		/** @type {TwitchSearchChannel} */
		const model = store.modelFor( "twitch-search-channel" );

		assertRelationships( assert, model, [
			{
				key: "user",
				kind: "belongsTo",
				type: "twitch-user",
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

		/** @type {TwitchSearchChannel} */
		const record = store.createRecord( "twitch-search-channel", {} );

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

		/** @type {TwitchSearchChannel} */
		const record = store.createRecord( "twitch-search-channel", {} );

		const day = 3600 * 24 * 1000;
		this.fakeTimer.setSystemTime( 2 * day );

		assert.strictEqual(
			record.titleStartedAt,
			"models.twitch.search-channel.started-at.offline",
			"Shows an offline title for streams without started_at attribute"
		);

		set( record, "started_at", new Date( Date.now() - 1 ) );
		assert.strictEqual(
			record.titleStartedAt,
			"models.twitch.search-channel.started-at.less-than-24h"
			+ "{\"started_at\":\"1970-01-02T23:59:59.999Z\"}",
			"Shows a shorthand title for streams running for less than 24h"
		);

		set( record, "started_at", new Date( Date.now() - day ) );
		assert.strictEqual(
			record.titleStartedAt,
			"models.twitch.search-channel.started-at.more-than-24h"
			+ "{\"started_at\":\"1970-01-02T00:00:00.000Z\"}",
			"Shows an extended title for streams running for more than 24h"
		);
	});

	test( "query", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		const searchChannelResponseStub
			= store.adapterFor( "twitch-search-channel" ).ajax
			= adapterRequestFactory( assert, TwitchSearchChannelFixtures, "search-channel" );
		const userResponseStub
			= store.adapterFor( "twitch-user" ).ajax
			= adapterRequestFactory( assert, TwitchSearchChannelFixtures, "user" );
		const gameResponseStub
			= store.adapterFor( "twitch-game" ).ajax
			= adapterRequestFactory( assert, TwitchSearchChannelFixtures, "game" );

		/** @type {DS.AdapterPopulatedRecordArray<TwitchSearchChannel>} */
		const records = await store.query( "twitch-search-channel", {
			query: "foo",
			live_only: true
		});

		assert.propEqual(
			records.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "1",
					user: "1",
					broadcaster_language: "en",
					broadcaster_login: "foo",
					display_name: "FOO",
					game: "1",
					game_name: "some game",
					is_live: true,
					thumbnail_url: "https://mock/twitch-search-channel/1/thumbnail-640x360.jpg",
					title: "some title",
					started_at: "2000-01-01T00:00:00.000Z"
				},
				{
					id: "2",
					user: "2",
					broadcaster_language: "de",
					broadcaster_login: "bar",
					display_name: "BAR",
					game: "2",
					game_name: "another game",
					is_live: true,
					thumbnail_url: "https://mock/twitch-search-channel/2/thumbnail-640x360.jpg",
					title: "another title",
					started_at: "1999-12-31T23:59:59.000Z"
				}
			],
			"All records have the correct IDs, attributes and relationship IDs"
		);
		assert.propEqual(
			store.peekAll( "twitch-search-channel" ).mapBy( "id" ),
			[ "1", "2" ],
			"Has all TwitchSearchChannel records registered in the data store"
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
		assert.ok( searchChannelResponseStub.calledOnce, "Queries API once for search-channels" );
		assert.notOk( userResponseStub.called, "Hasn't queried API for user" );
		assert.notOk( gameResponseStub.called, "Hasn't queried API for game" );

		await Promise.all( records.map( record => record.user.promise ) );
		assert.propEqual(
			store.peekAll( "twitch-user" ).mapBy( "id" ),
			[ "1", "2" ],
			"Has all TwitchUser records registered in the data store"
		);
		assert.ok( userResponseStub.calledOnce, "Has queried API for user" );

		await Promise.all( records.map( record => record.game.promise ) );
		assert.propEqual(
			store.peekAll( "twitch-game" ).mapBy( "id" ),
			[ "1", "2" ],
			"Has all TwitchGame records registered in the data store"
		);
		assert.ok( userResponseStub.calledOnce, "Has queried API for game" );

		const { /** @type {TwitchSearchChannel} */ firstObject: record } = records;

		this.fakeTimer.setSystemTime( 1234 );
		assert.strictEqual(
			`${record.thumbnail_url}`,
			"https://mock/twitch-search-channel/1/thumbnail-640x360.jpg",
			"Has the correct URL for the thumbnail image"
		);
		assert.strictEqual(
			record.thumbnail_url.latest,
			"https://mock/twitch-search-channel/1/thumbnail-640x360.jpg?_=61234",
			"Sets an expiration date parameter"
		);

		this.fakeTimer.tick( 59999 );
		assert.strictEqual(
			record.thumbnail_url.latest,
			"https://mock/twitch-search-channel/1/thumbnail-640x360.jpg?_=61234",
			"Doesn't update the expiration date parameter yet"
		);

		this.fakeTimer.tick( 1 );
		assert.strictEqual(
			record.thumbnail_url.latest,
			"https://mock/twitch-search-channel/1/thumbnail-640x360.jpg?_=121234",
			"Updates the expiration date parameter"
		);
	});
});
