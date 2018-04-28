import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import { I18nService } from "i18n-utils";
import { get } from "@ember/object";
import Service from "@ember/service";

import StreamFeatured from "data/models/twitch/stream-featured/model";
import StreamFeaturedSerializer from "data/models/twitch/stream-featured/serializer";
import Stream from "data/models/twitch/stream/model";
import StreamSerializer from "data/models/twitch/stream/serializer";
import Channel from "data/models/twitch/channel/model";
import ChannelSerializer from "data/models/twitch/channel/serializer";
import imageInjector from "inject-loader?config!data/models/twitch/image/model";
import ImageSerializer from "data/models/twitch/image/serializer";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchStreamFeaturedFixtures from "fixtures/data/models/twitch/stream-featured.json";


const TwitchImage = imageInjector({
	config: {
		vars: {}
	}
})[ "default" ];


let owner, env;


module( "data/models/twitch/stream-featured", {
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
