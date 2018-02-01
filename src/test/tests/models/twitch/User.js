import {
	module,
	test
} from "qunit";
import {
	buildOwner,
	runDestroy
} from "test-utils";
import {
	setupStore,
	adapterRequest
} from "store-utils";
import {
	get,
	Service
} from "ember";
import User from "models/twitch/User";
import UserAdapter from "models/twitch/UserAdapter";
import UserSerializer from "models/twitch/UserSerializer";
import Stream from "models/twitch/Stream";
import StreamSerializer from "models/twitch/StreamSerializer";
import Channel from "models/twitch/Channel";
import ChannelSerializer from "models/twitch/ChannelSerializer";
import imageInjector from "inject-loader?config!models/twitch/Image";
import ImageSerializer from "models/twitch/ImageSerializer";
import TwitchAdapter from "store/TwitchAdapter";
import TwitchUserFixtures from "fixtures/models/twitch/User.json";
import TwitchChannelFixtures from "fixtures/models/twitch/Channel.json";
import TwitchStreamFixtures from "fixtures/models/twitch/Stream.json";


const TwitchImage = imageInjector({
	config: {
		vars: {}
	}
})[ "default" ];


let owner, env;


module( "models/twitch/User", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend() );
		owner.register( "service:settings", Service.extend() );
		owner.register( "model:twitch-user", User );
		owner.register( "adapter:twitch-user", UserAdapter );
		owner.register( "serializer:twitch-user", UserSerializer );
		owner.register( "model:twitch-channel", Channel );
		owner.register( "adapter:twitch-channel", TwitchAdapter.extend() );
		owner.register( "serializer:twitch-channel", ChannelSerializer );
		owner.register( "model:twitch-stream", Stream );
		owner.register( "adapter:twitch-stream", TwitchAdapter.extend() );
		owner.register( "serializer:twitch-stream", StreamSerializer );
		owner.register( "model:twitch-image", TwitchImage );
		owner.register( "serializer:twitch-image", ImageSerializer );

		env = setupStore( owner );
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "Adapter and Serializer", assert => {

	env.store.adapterFor( "twitchUser" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchUserFixtures[ "by-id" ], url, method, query );

	env.store.adapterFor( "twitchChannel" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchChannelFixtures[ "by-id" ], url, method, query );

	env.store.adapterFor( "twitchStream" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchStreamFixtures[ "single" ], url, method, query );

	return env.store.findRecord( "twitchUser", "foo" )
		.then( record => {
			assert.deepEqual(
				record.toJSON({ includeId: true }),
				{
					id: "foo",
					channel: "1",
					stream: "1"
				},
				"Records have the correct id and attributes"
			);

			assert.ok(
				!env.store.hasRecordForId( "twitchChannel", 1 ),
				"Does not have a channel record registered in the data store"
			);

			assert.ok(
				!env.store.hasRecordForId( "twitchStream", 1 ),
				"Does not have a stream record registered in the data store"
			);

			assert.ok(
				!env.store.hasRecordForId( "twitchImage", "stream/preview/1" ),
				"Does not have an image record registered in the data store"
			);

			return get( record, "channel" )
				.then( () => {
					assert.ok(
						env.store.hasRecordForId( "twitchChannel", "1" ),
						"Store does have a channel record registered after accessing the channel"
					);
				})
				.then( () => get( record, "stream" ) )
				.then( () => {
					assert.ok(
						env.store.hasRecordForId( "twitchStream", "1" ),
						"Store does have a stream record registered after accessing the stream"
					);
					assert.ok(
						env.store.hasRecordForId( "twitchChannel", "1" ),
						"Store does have a channel record registered after accessing the channel"
					);
					assert.ok(
						env.store.hasRecordForId( "twitchImage", "stream/preview/1" ),
						"Store does have an image record registered after accessing the stream"
					);
				});
		});

});
