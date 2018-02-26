import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import { get } from "@ember/object";
import Service from "@ember/service";

import StreamHosted from "models/twitch/StreamHosted";
import StreamHostedSerializer from "models/twitch/StreamHostedSerializer";
import Stream from "models/twitch/Stream";
import StreamSerializer from "models/twitch/StreamSerializer";
import Channel from "models/twitch/Channel";
import ChannelSerializer from "models/twitch/ChannelSerializer";
import imageInjector from "inject-loader?config!models/twitch/Image";
import ImageSerializer from "models/twitch/ImageSerializer";
import TwitchAdapter from "store/TwitchAdapter";
import TwitchStreamHostedFixtures from "fixtures/models/twitch/StreamHosted.json";
import TwitchStreamFixtures from "fixtures/models/twitch/Stream.json";


const TwitchImage = imageInjector({
	config: {
		vars: {}
	}
})[ "default" ];


let owner, env;


module( "models/twitch/StreamHosted", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend({
			session: {
				user_name: "foobar"
			}
		}) );
		owner.register( "service:settings", Service.extend() );
		owner.register( "model:twitch-stream-hosted", StreamHosted );
		owner.register( "adapter:twitch-stream-hosted", TwitchAdapter.extend() );
		owner.register( "serializer:twitch-stream-hosted", StreamHostedSerializer );
		owner.register( "model:twitch-stream", Stream );
		owner.register( "adapter:twitch-stream", TwitchAdapter.extend() );
		owner.register( "serializer:twitch-stream", StreamSerializer );
		owner.register( "model:twitch-channel", Channel );
		owner.register( "serializer:twitch-channel", ChannelSerializer );
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

	env.store.adapterFor( "twitchStreamHosted" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchStreamHostedFixtures, url, method, query );

	env.store.adapterFor( "twitchStream" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchStreamFixtures[ "single" ], url, method, query );

	return env.store.query( "twitchStreamHosted", {} )
		.then( records => {
			assert.strictEqual(
				get( records, "length" ),
				2,
				"Returns all records"
			);

			assert.strictEqual(
				get( records, "meta.total" ),
				1000,
				"Recordarray has metadata with total number of games"
			);

			assert.deepEqual(
				records.map( record => record.toJSON({ includeId: true }) ),
				[
					{
						id: "2",
						target: "1",
						display_name: "Bar",
						name: "bar"
					},
					{
						id: "4",
						target: "3",
						display_name: "Qux",
						name: "qux"
					}
				],
				"Models have the correct id and attributes"
			);

			assert.strictEqual(
				env.store.peekAll( "twitchStream" ).get( "length" ),
				0,
				"Does not have any Stream records registered in the data store"
			);

			assert.strictEqual(
				env.store.peekAll( "twitchChannel" ).get( "length" ),
				0,
				"Does not have any Channel records registered in the data store"
			);

			assert.strictEqual(
				env.store.peekAll( "twitchImage" ).get( "length" ),
				0,
				"Does not have any Image records registered in the data store"
			);

			return get( records, "firstObject.target" )
				.then( () => {
					assert.ok(
						env.store.hasRecordForId( "twitchStream", "1" ),
						"Store has a Stream record registered after accessing the first target"
					);
					assert.ok(
						env.store.hasRecordForId( "twitchChannel", "1" ),
						"Store has a Channel record registered after accessing the first target"
					);
					assert.ok(
						env.store.hasRecordForId( "twitchImage", "stream/preview/1" ),
						"Store has a Image record registered after accessing the first target"
					);
				});
		});

});
