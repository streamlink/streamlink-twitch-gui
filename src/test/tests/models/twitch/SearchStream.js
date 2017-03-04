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
import { Service } from "Ember";
import SearchStream from "models/twitch/SearchStream";
import SearchStreamSerializer from "models/twitch/SearchStreamSerializer";
import Stream from "models/twitch/Stream";
import StreamSerializer from "models/twitch/StreamSerializer";
import Channel from "models/twitch/Channel";
import ChannelSerializer from "models/twitch/ChannelSerializer";
import imageInjector from "inject-loader?config!models/twitch/Image";
import ImageSerializer from "models/twitch/ImageSerializer";
import TwitchAdapter from "store/TwitchAdapter";
import TwitchSearchStreamFixtures from "fixtures/models/twitch/SearchStream.json";


const TwitchImage = imageInjector({
	config: {
		vars: {}
	}
})[ "default" ];


let owner, env;


module( "models/twitch/SearchStream", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend() );
		owner.register( "model:twitch-search-stream", SearchStream );
		owner.register( "serializer:twitch-search-stream", SearchStreamSerializer );
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
		adapterRequest( assert, TwitchSearchStreamFixtures, url, method, query );

	return env.store.query( "twitchSearchStream", { query: "foo" } )
		.then( records => {
			assert.deepEqual(
				records.map( record => record.toJSON({ includeId: true }) ),
				[
					{
						id: "2",
						stream: "2"
					},
					{
						id: "4",
						stream: "4"
					}
				],
				"Models have the correct id and attributes"
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
