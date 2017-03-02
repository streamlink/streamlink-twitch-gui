import {
	module,
	test
} from "QUnit";
import {
	buildOwner,
	runDestroy
} from "Testutils";
import {
	setupStore,
	adapterRequest
} from "Store";
import {
	get,
	set,
	run,
	Service
} from "Ember";
import Stream from "models/twitch/Stream";
import StreamSerializer from "models/twitch/StreamSerializer";
import Channel from "models/twitch/Channel";
import ChannelSerializer from "models/twitch/ChannelSerializer";
import imageInjector from "inject-loader?config!models/twitch/Image";
import ImageSerializer from "models/twitch/ImageSerializer";
import TwitchAdapter from "store/TwitchAdapter";
import TwitchStreamFixtures from "fixtures/models/twitch/Stream.json";


const TwitchImage = imageInjector({
	config: {
		vars: {}
	}
})[ "default" ];


let owner, env;


module( "models/twitch/Stream", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend() );
		owner.register( "model:twitch-stream", Stream );
		owner.register( "serializer:twitch-stream", StreamSerializer );
		owner.register( "model:twitch-channel", Channel );
		owner.register( "serializer:twitch-channel", ChannelSerializer );
		owner.register( "model:twitch-image", TwitchImage );
		owner.register( "serializer:twitch-image", ImageSerializer );

		env = setupStore( owner, { adapter: TwitchAdapter } );
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "Adapter and Serializer (single)", assert => {

	env.adapter.ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchStreamFixtures[ "single" ], url, method, query );

	return env.store.findRecord( "twitchStream", 1 )
		.then( record => {
			assert.deepEqual(
				record.toJSON({ includeId: true }),
				{
					id: "2",
					average_fps: 60,
					channel: "2",
					created_at: "2000-01-01T00:00:00.000Z",
					delay: 0,
					game: "some game",
					preview: "stream/preview/2",
					video_height: 1080,
					viewers: 1000
				},
				"Has the correct model id and attributes"
			);

			assert.deepEqual(
				get( record, "channel" ).toJSON({ includeId: true }),
				{
					id: "2",
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
					id: "stream/preview/2",
					image_large: "large.jpg",
					image_medium: "medium.jpg",
					image_small: "small.jpg"
				},
				"The preview relation has the correct attributes"
			);

			assert.ok(
				env.store.hasRecordForId( "twitchChannel", 2 ),
				"Store has a TwitchChannel record of the the embedded channel data"
			);
			assert.ok(
				env.store.hasRecordForId( "twitchImage", "stream/preview/2" ),
				"Store has a TwitchImage record of the the embedded preview image data"
			);
		});

});


test( "Adapter and Serializer (many)", assert => {

	env.adapter.ajax = ( url, method, query ) =>
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


test( "Computed properties", assert => {

	const record = env.store.createRecord( "twitchStream", {} );


	// titleCreatedAt

	run( () => set( record, "created_at", new Date( Date.now() - 3600*1*1000 ) ) );
	assert.ok(
		/^Online since \d+:\d+:\d+ [AP]M$/.test( get( record, "titleCreatedAt" ) ),
		"Shows a shorthand title for streams running less than 24h"
	);

	run( () => set( record, "created_at", new Date( Date.now() - 3600*24*1000 ) ) );
	assert.ok(
		/^Online since \w+, \w+ \d+, \d{4} \d+:\d+ [AP]M$/.test( get( record, "titleCreatedAt" ) ),
		"Shows an extended title for streams running more than 24h"
	);


	// titleViewers

	run( () => set( record, "viewers", 1 ) );
	assert.strictEqual(
		get( record, "titleViewers" ),
		"1 person is watching",
		"Shows the correct title when one person is watching"
	);

	run( () => set( record, "viewers", 2 ) );
	assert.strictEqual(
		get( record, "titleViewers" ),
		"2 people are watching",
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
