import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import { FakeIntlService } from "intl-utils";
import sinon from "sinon";

import { set, setProperties } from "@ember/object";
import { run } from "@ember/runloop";
import Service from "@ember/service";

import TwitchStream from "data/models/twitch/stream/model";
import TwitchStreamAdapter from "data/models/twitch/stream/adapter";
import TwitchStreamSerializer from "data/models/twitch/stream/serializer";
import TwitchChannel from "data/models/twitch/channel/model";
import TwitchChannelSerializer from "data/models/twitch/channel/serializer";
import twitchImageInjector from "inject-loader?config!data/models/twitch/image/model";
import TwitchImageSerializer from "data/models/twitch/image/serializer";
import TwitchStreamFixtures from "fixtures/data/models/twitch/stream.json";


module( "data/models/twitch/stream", function( hooks ) {
	const { default: TwitchImage } = twitchImageInjector({
		config: {
			vars: {}
		}
	});

	setupTest( hooks, {
		resolver: buildResolver({
			TwitchStream,
			TwitchStreamAdapter,
			TwitchStreamSerializer,
			TwitchChannel,
			TwitchChannelSerializer,
			TwitchImage,
			TwitchImageSerializer,
			AuthService: Service.extend(),
			IntlService: FakeIntlService,
			SettingsService: Service.extend({
				content: {
					streams: {
						vodcast_regexp: ""
					}
				}
			})
		})
	});

	hooks.beforeEach(function() {
		this.fakeTimer = sinon.useFakeTimers({
			toFake: [ "Date" ],
			target: window
		});

		setupStore( this.owner );
	});

	hooks.afterEach(function() {
		this.fakeTimer.restore();
	});


	test( "Adapter and Serializer (single)", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		store.adapterFor( "twitch-stream" ).ajax = ( url, method, query ) =>
			adapterRequest( assert, TwitchStreamFixtures[ "single" ], url, method, query );

		// stream query IDs are actually channel IDs
		/** @type {TwitchStream} */
		const record = await store.findRecord( "twitch-stream", 1 );
		assert.propEqual(
			record.toJSON({ includeId: true }),
			{
				id: "1",
				average_fps: 60,
				broadcast_platform: "live",
				channel: "1",
				created_at: "2000-01-01T00:00:00.000Z",
				delay: 0,
				game: "some game",
				preview: "stream/preview/1",
				stream_type: "live",
				video_height: 1080,
				viewers: 1000
			},
			"Has the correct model id and attributes"
		);
		assert.propEqual(
			record.channel.toJSON({ includeId: true }),
			{
				id: "1",
				broadcaster_language: "en",
				created_at: "2000-01-01T00:00:00.000Z",
				display_name: "Foo",
				followers: 1337,
				game: "some game",
				language: "en",
				logo: "logo",
				mature: false,
				name: "foo",
				partner: false,
				profile_banner: null,
				profile_banner_background_color: null,
				status: "Playing some game",
				updated_at: "2000-01-01T00:00:01.000Z",
				url: "https://www.twitch.tv/foo",
				video_banner: null,
				views: 13337
			},
			"The channel relation has the correct attributes"
		);
		assert.propEqual(
			record.preview.toJSON({ includeId: true }),
			{
				id: "stream/preview/1",
				image_large: "large.jpg",
				image_medium: "medium.jpg",
				image_small: "small.jpg"
			},
			"The preview relation has the correct attributes"
		);
		assert.ok(
			store.hasRecordForId( "twitch-channel", 1 ),
			"Store has a TwitchChannel record of the the embedded channel data"
		);
		assert.ok(
			store.hasRecordForId( "twitch-image", "stream/preview/1" ),
			"Store has a TwitchImage record of the the embedded preview image data"
		);
	});

	test( "Adapter and Serializer (many)", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		store.adapterFor( "twitch-stream" ).ajax = ( url, method, query ) =>
			adapterRequest( assert, TwitchStreamFixtures[ "many" ], url, method, query );

		/** @type {TwitchStream[]} */
		const records = await store.query( "twitch-stream", {} );
		assert.strictEqual(
			records.length,
			3,
			"Returns all records"
		);
		assert.strictEqual(
			records.meta.total,
			3,
			"Recordarray has metadata with total number of streams"
		);
		assert.ok(
			   store.hasRecordForId( "twitch-stream", 2 )
			&& store.hasRecordForId( "twitch-stream", 4 )
			&& store.hasRecordForId( "twitch-stream", 6 ),
			"Has all stream records registered in the data store"
		);
		assert.ok(
			   store.hasRecordForId( "twitch-channel", 2 )
			&& store.hasRecordForId( "twitch-channel", 4 )
			&& store.hasRecordForId( "twitch-channel", 6 ),
			"Has all channel records registered in the data store"
		);
		assert.ok(
			   store.hasRecordForId( "twitch-image", "stream/preview/2" )
			&& store.hasRecordForId( "twitch-image", "stream/preview/4" )
			&& store.hasRecordForId( "twitch-image", "stream/preview/6" ),
			"Has all image records registered in the data store"
		);
	});

	test( "Computed properties", function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		/** @type {TwitchChannel} */
		const channel = store.createRecord( "twitch-channel", { status: "" } );
		/** @type {TwitchStream} */
		const record = store.createRecord( "twitch-stream", { channel } );

		// vodcast

		assert.ok( record.reVodcast instanceof RegExp, "Has a default vodcast RegExp" );

		set( record, "settings.content.streams.vodcast_regexp", " " );
		assert.strictEqual( record.reVodcast, null, "Returns null on empty RegExp" );

		set( record, "settings.content.streams.vodcast_regexp", "(" );
		assert.strictEqual( record.reVodcast, null, "Returns null on invalid RegExp" );

		set( record, "settings.content.streams.vodcast_regexp", "I'm a vodcast" );
		assert.ok( record.reVodcast.test( "I'M A VODCAST" ), "Has a custom vodcast RegExp" );

		assert.notOk( record.isVodcast, "Not a vodcast" );

		setProperties( record, {
			broadcast_platform: "watch_party",
			stream_type: "live"
		});
		assert.ok( record.isVodcast, "Is a vodcast now" );

		setProperties( record, {
			broadcast_platform: "rerun",
			stream_type: "live"
		});
		assert.ok( record.isVodcast, "Is still vodcast/rerun" );

		setProperties( record, {
			broadcast_platform: "live",
			stream_type: "watch_party"
		});
		assert.ok( record.isVodcast, "Is still a vodcast" );

		setProperties( record, {
			broadcast_platform: "live",
			stream_type: "rerun"
		});
		assert.ok( record.isVodcast, "Is still a vodcast/rerun" );

		setProperties( record, {
			broadcast_platform: "live",
			stream_type: "live"
		});
		assert.notOk( record.isVodcast, "Not a vodcast anymore" );

		set( record, "channel.status", "I'm a vodcast" );
		assert.ok( record.isVodcast, "Is a vodcast because of its title" );

		// titleCreatedAt

		const day = 3600 * 24 * 1000;
		this.fakeTimer.setSystemTime( 2 * day );

		run( () => set( record, "created_at", new Date( Date.now() - 1 ) ) );
		assert.strictEqual(
			record.titleCreatedAt,
			[
				"models.twitch.stream.created-at.less-than-24h",
				"{\"created_at\":\"1970-01-02T23:59:59.999Z\"}"
			].join( "" ),
			"Shows a shorthand title for streams running for less than 24h"
		);

		run( () => set( record, "created_at", new Date( Date.now() - day ) ) );
		assert.strictEqual(
			record.titleCreatedAt,
			[
				"models.twitch.stream.created-at.more-than-24h",
				"{\"created_at\":\"1970-01-02T00:00:00.000Z\"}"
			].join( "" ),
			"Shows an extended title for streams running for more than 24h"
		);

		// titleViewers

		run( () => set( record, "viewers", 1 ) );
		assert.strictEqual(
			record.titleViewers,
			"models.twitch.stream.viewers{\"count\":1}",
			"Shows the correct title when one person is watching"
		);

		run( () => set( record, "viewers", 2 ) );
		assert.strictEqual(
			record.titleViewers,
			"models.twitch.stream.viewers{\"count\":2}",
			"Shows the correct title when more than one person is watching"
		);

		// hasFormatInfo

		assert.ok(
			!record.hasFormatInfo,
			"Doesn't have format info when attrs are missing"
		);

		run( () => set( record, "average_fps", 60 ) );
		assert.ok(
			!record.hasFormatInfo,
			"Doesn't have format info when only one attr is set"
		);

		run( () => set( record, "video_height", 1080 ) );
		assert.ok(
			record.hasFormatInfo,
			"Does have format info when both attrs are set"
		);

		run( () => set( record, "average_fps", null ) );
		assert.ok(
			!record.hasFormatInfo,
			"Doesn't have format info when one attr is missing"
		);

		// resolution

		assert.strictEqual(
			record.resolution,
			"1920x1080",
			"Assumes the correct resolution"
		);

		// fps

		assert.strictEqual( record.fps, null, "fps is unknown when average_fps is missing" );

		run( () => set( record, "average_fps", 19.99 ) );
		assert.strictEqual( record.fps, 19, "Rounds down fps when no range could be found" );

		run( () => set( record, "average_fps", 62 ) );
		assert.strictEqual( record.fps, 60, "Uses a common fps value for a matching range" );
	});
});
