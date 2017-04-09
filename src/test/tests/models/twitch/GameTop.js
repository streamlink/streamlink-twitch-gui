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
import GameTop from "models/twitch/GameTop";
import GameTopSerializer from "models/twitch/GameTopSerializer";
import Game from "models/twitch/Game";
import GameSerializer from "models/twitch/GameSerializer";
import imageInjector from "inject-loader?config!models/twitch/Image";
import ImageSerializer from "models/twitch/ImageSerializer";
import TwitchAdapter from "store/TwitchAdapter";
import TwitchGameTopFixtures from "fixtures/models/twitch/GameTop.json";


const TwitchImage = imageInjector({
	config: {
		vars: {}
	}
})[ "default" ];


let owner, env;


module( "models/twitch/GameTop", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend() );
		owner.register( "model:twitch-game-top", GameTop );
		owner.register( "serializer:twitch-game-top", GameTopSerializer );
		owner.register( "model:twitch-game", Game );
		owner.register( "serializer:twitch-game", GameSerializer );
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
		adapterRequest( assert, TwitchGameTopFixtures, url, method, query );

	return env.store.query( "twitchGameTop", {} )
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
						id: "Game A",
						game: "Game A",
						channels: 1000,
						viewers: 100000
					},
					{
						id: "Game B",
						game: "Game B",
						channels: 100,
						viewers: 10000
					}
				],
				"Models have the correct id and attributes"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchGameTop", "Game A" )
				&& env.store.hasRecordForId( "twitchGameTop", "Game B" ),
				"Has all GameTop records registered in the data store"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchGame", "Game A" )
				&& env.store.hasRecordForId( "twitchGame", "Game B" ),
				"Has all Game records registered in the data store"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchImage", "game/box/Game A" )
				&& env.store.hasRecordForId( "twitchImage", "game/logo/Game A" )
				&& env.store.hasRecordForId( "twitchImage", "game/box/Game B" )
				&& env.store.hasRecordForId( "twitchImage", "game/logo/Game B" ),
				"Has all image records registered in the data store"
			);
		});

});
