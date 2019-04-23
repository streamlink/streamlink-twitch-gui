import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import { FakeI18nService } from "i18n-utils";
import { get, set, setProperties } from "@ember/object";
import { run } from "@ember/runloop";
import Service from "@ember/service";
import Moment from "moment";
import sinon from "sinon";

import Stream from "data/models/twitch/stream/model";
import StreamAdapter from "data/models/twitch/stream/adapter";
import StreamSerializer from "data/models/twitch/stream/serializer";
import Channel from "data/models/twitch/channel/model";
import ChannelSerializer from "data/models/twitch/channel/serializer";
import imageInjector from "inject-loader?config!data/models/twitch/image/model";
import ImageSerializer from "data/models/twitch/image/serializer";
import TwitchStreamFixtures from "fixtures/data/models/twitch/stream.json";


const TwitchImage = imageInjector({
	config: {
		vars: {}
	}
})[ "default" ];


let owner, env;


module( "data/models/twitch/stream", {
	beforeEach() {
		this.fakeTimer = sinon.useFakeTimers({
			toFake: [ "Date" ],
			target: window
		});
		this.momentFormatStub = sinon.stub( Moment.prototype, "format" );

		owner = buildOwner();

		owner.register( "model:twitch-stream", Stream );
		owner.register( "adapter:twitch-stream", StreamAdapter );
		owner.register( "serializer:twitch-stream", StreamSerializer );
		owner.register( "model:twitch-channel", Channel );
		owner.register( "serializer:twitch-channel", ChannelSerializer );
		owner.register( "model:twitch-image", TwitchImage );
		owner.register( "serializer:twitch-image", ImageSerializer );

		owner.register( "service:auth", Service.extend() );
		owner.register( "service:i18n", FakeI18nService );
		owner.register( "service:settings", Service.extend({
			content: {
				streams: {
					vodcast_regexp: ""
				}
			}
		}) );

		env = setupStore( owner );
	},

	afterEach() {
		this.fakeTimer.restore();
		this.momentFormatStub.restore();

		runDestroy( owner );
		owner = env = null;
	}
});


test( "Adapter and Serializer (single)", assert => {

	env.store.adapterFor( "twitchStream" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchStreamFixtures[ "single" ], url, method, query );

	// stream query IDs are actually channel IDs
	return env.store.findRecord( "twitchStream", 1 )
		.then( record => {
			assert.deepEqual(
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

			assert.deepEqual(
				get( record, "channel" ).toJSON({ includeId: true }),
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

			assert.deepEqual(
				get( record, "preview" ).toJSON({ includeId: true }),
				{
					id: "stream/preview/1",
					image_large: "large.jpg",
					image_medium: "medium.jpg",
					image_small: "small.jpg"
				},
				"The preview relation has the correct attributes"
			);

			assert.ok(
				env.store.hasRecordForId( "twitchChannel", 1 ),
				"Store has a TwitchChannel record of the the embedded channel data"
			);
			assert.ok(
				env.store.hasRecordForId( "twitchImage", "stream/preview/1" ),
				"Store has a TwitchImage record of the the embedded preview image data"
			);
		});

});


test( "Adapter and Serializer (many)", assert => {

	env.store.adapterFor( "twitchStream" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchStreamFixtures[ "many" ], url, method, query );

	return env.store.query( "twitchStream", {} )
		.then( records => {
			assert.strictEqual(
				get( records, "length" ),
				3,
				"Returns all records"
			);

			assert.strictEqual(
				get( records, "meta.total" ),
				3,
				"Recordarray has metadata with total number of streams"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchStream", 2 )
				&& env.store.hasRecordForId( "twitchStream", 4 )
				&& env.store.hasRecordForId( "twitchStream", 6 ),
				"Has all stream records registered in the data store"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchChannel", 2 )
				&& env.store.hasRecordForId( "twitchChannel", 4 )
				&& env.store.hasRecordForId( "twitchChannel", 6 ),
				"Has all channel records registered in the data store"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchImage", "stream/preview/2" )
				&& env.store.hasRecordForId( "twitchImage", "stream/preview/4" )
				&& env.store.hasRecordForId( "twitchImage", "stream/preview/6" ),
				"Has all image records registered in the data store"
			);
		});

});


test( "Computed properties", function( assert ) {

	const channel = env.store.createRecord( "twitchChannel", {
		status: ""
	});
	const record = env.store.createRecord( "twitchStream", { channel } );
	const settings = owner.lookup( "service:settings" ).content;


	// vodcast

	assert.ok( get( record, "reVodcast" ) instanceof RegExp, "Has a default vodcast RegExp" );

	set( settings, "streams.vodcast_regexp", " " );
	assert.strictEqual( get( record, "reVodcast" ), null, "Returns null on empty RegExp" );

	set( settings, "streams.vodcast_regexp", "(" );
	assert.strictEqual( get( record, "reVodcast" ), null, "Returns null on invalid RegExp" );

	set( settings, "streams.vodcast_regexp", "I'm a vodcast" );
	assert.ok( get( record, "reVodcast" ).test( "I'M A VODCAST" ), "Has a custom vodcast RegExp" );

	assert.notOk( get( record, "isVodcast" ), "Not a vodcast" );

	setProperties( record, {
		broadcast_platform: "watch_party",
		stream_type: "live"
	});
	assert.ok( get( record, "isVodcast" ), "Is a vodcast now" );

	setProperties( record, {
		broadcast_platform: "rerun",
		stream_type: "live"
	});
	assert.ok( get( record, "isVodcast" ), "Is still vodcast/rerun" );

	setProperties( record, {
		broadcast_platform: "live",
		stream_type: "watch_party"
	});
	assert.ok( get( record, "isVodcast" ), "Is still a vodcast" );

	setProperties( record, {
		broadcast_platform: "live",
		stream_type: "rerun"
	});
	assert.ok( get( record, "isVodcast" ), "Is still a vodcast/rerun" );

	setProperties( record, {
		broadcast_platform: "live",
		stream_type: "live"
	});
	assert.notOk( get( record, "isVodcast" ), "Not a vodcast anymore" );

	set( record, "channel.status", "I'm a vodcast" );
	assert.ok( get( record, "isVodcast" ), "Is a vodcast because of its title" );


	// titleCreatedAt

	const day = 3600 * 24 * 1000;
	this.fakeTimer.setSystemTime( 2 * day );
	this.momentFormatStub.returnsArg( 0 );

	run( () => set( record, "created_at", new Date( Date.now() - 1 ) ) );
	assert.strictEqual(
		get( record, "titleCreatedAt" ),
		"models.twitch.stream.created-at.less-than-24h",
		"Shows a shorthand title for streams running for less than 24h"
	);

	run( () => set( record, "created_at", new Date( Date.now() - day ) ) );
	assert.strictEqual(
		get( record, "titleCreatedAt" ),
		"models.twitch.stream.created-at.more-than-24h",
		"Shows an extended title for streams running for more than 24h"
	);


	// titleViewers

	run( () => set( record, "viewers", 1 ) );
	assert.strictEqual(
		get( record, "titleViewers" ),
		"models.twitch.stream.viewers{\"count\":1}",
		"Shows the correct title when one person is watching"
	);

	run( () => set( record, "viewers", 2 ) );
	assert.strictEqual(
		get( record, "titleViewers" ),
		"models.twitch.stream.viewers{\"count\":2}",
		"Shows the correct title when more than one person is watching"
	);


	// hasFormatInfo

	assert.ok(
		!get( record, "hasFormatInfo" ),
		"Doesn't have format info when attrs are missing"
	);

	run( () => set( record, "average_fps", 60 ) );
	assert.ok(
		!get( record, "hasFormatInfo" ),
		"Doesn't have format info when only one attr is set"
	);

	run( () => set( record, "video_height", 1080 ) );
	assert.ok(
		get( record, "hasFormatInfo" ),
		"Does have format info when both attrs are set"
	);

	run( () => set( record, "average_fps", null ) );
	assert.ok(
		!get( record, "hasFormatInfo" ),
		"Doesn't have format info when one attr is missing"
	);


	// resolution

	assert.strictEqual(
		get( record, "resolution" ),
		"1920x1080",
		"Assumes the correct resolution"
	);


	// fps

	assert.strictEqual( get( record, "fps" ), null, "fps is unknown when average_fps is missing" );

	run( () => set( record, "average_fps", 19.99 ) );
	assert.strictEqual( get( record, "fps" ), 19, "Rounds down fps when no range could be found" );

	run( () => set( record, "average_fps", 62 ) );
	assert.strictEqual( get( record, "fps" ), 60, "Uses a common fps value for a matching range" );

});
