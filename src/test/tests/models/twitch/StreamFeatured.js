import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import { I18nService } from "i18n-utils";
import { get } from "@ember/object";
import Service from "@ember/service";

import StreamFeatured from "models/twitch/StreamFeatured";
import StreamFeaturedSerializer from "models/twitch/StreamFeaturedSerializer";
import Stream from "models/twitch/Stream";
import StreamSerializer from "models/twitch/StreamSerializer";
import Channel from "models/twitch/Channel";
import ChannelSerializer from "models/twitch/ChannelSerializer";
import imageInjector from "inject-loader?config!models/twitch/Image";
import ImageSerializer from "models/twitch/ImageSerializer";
import TwitchAdapter from "store/TwitchAdapter";
import TwitchStreamFeaturedFixtures from "fixtures/models/twitch/StreamFeatured.json";


const TwitchImage = imageInjector({
	config: {
		vars: {}
	}
})[ "default" ];


let owner, env;


module( "models/twitch/StreamFeatured", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend() );
		owner.register( "service:i18n", I18nService );
		owner.register( "model:twitch-stream-featured", StreamFeatured );
		owner.register( "serializer:twitch-stream-featured", StreamFeaturedSerializer );
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


test( "Adapter and Serializer", assert => {

	env.adapter.ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchStreamFeaturedFixtures, url, method, query );

	return env.store.query( "twitchStreamFeatured", {} )
		.then( records => {
			assert.strictEqual(
				get( records, "length" ),
				2,
				"Returns all records"
			);

			assert.deepEqual(
				records.map( record => record.toJSON({ includeId: true }) ),
				[
					{
						id: "2",
						stream: "2",
						text: "foo bar",
						title: "foo",
						sponsored: false,
						priority: 5,
						scheduled: true,
						image: "foo.jpg"
					},
					{
						id: "4",
						stream: "4",
						text: "baz qux",
						title: "bar",
						sponsored: true,
						priority: 5,
						scheduled: true,
						image: "bar.jpg"
					}
				],
				"Models have the correct id and attributes"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchStreamFeatured", "2" )
				&& env.store.hasRecordForId( "twitchStreamFeatured", "4" ),
				"Has all StreamFeatured records registered in the data store"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchStream", "2" )
				&& env.store.hasRecordForId( "twitchStream", "4" ),
				"Has all Stream records registered in the data store"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchChannel", "2" )
				&& env.store.hasRecordForId( "twitchChannel", "4" ),
				"Has all Channel records registered in the data store"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchImage", "stream/preview/2" )
				&& env.store.hasRecordForId( "twitchImage", "stream/preview/4" ),
				"Has all Image records registered in the data store"
			);
		});

});
