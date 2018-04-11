import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import { I18nService } from "i18n-utils";
import { get } from "@ember/object";
import Service from "@ember/service";

import User from "data/models/twitch/user/model";
import UserAdapter from "data/models/twitch/user/adapter";
import UserSerializer from "data/models/twitch/user/serializer";
import Stream from "data/models/twitch/stream/model";
import StreamSerializer from "data/models/twitch/stream/serializer";
import Channel from "data/models/twitch/channel/model";
import ChannelSerializer from "data/models/twitch/channel/serializer";
import imageInjector from "inject-loader?config!data/models/twitch/image/model";
import ImageSerializer from "data/models/twitch/image/serializer";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchUserFixtures from "fixtures/data/models/twitch/user.json";
import TwitchChannelFixtures from "fixtures/data/models/twitch/channel.json";
import TwitchStreamFixtures from "fixtures/data/models/twitch/stream.json";


const TwitchImage = imageInjector({
	config: {
		vars: {}
	}
})[ "default" ];


let owner, env;


module( "data/models/twitch/user", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend() );
		owner.register( "service:i18n", I18nService );
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
