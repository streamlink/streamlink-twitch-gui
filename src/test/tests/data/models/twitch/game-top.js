import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import { get } from "@ember/object";
import Service from "@ember/service";

import GameTop from "data/models/twitch/game-top/model";
import GameTopSerializer from "data/models/twitch/game-top/serializer";
import Game from "data/models/twitch/game/model";
import GameSerializer from "data/models/twitch/game/serializer";
import imageInjector from "inject-loader?config!data/models/twitch/image/model";
import ImageSerializer from "data/models/twitch/image/serializer";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchGameTopFixtures from "fixtures/data/models/twitch/game-top.json";


const TwitchImage = imageInjector({
	config: {
		vars: {}
	}
})[ "default" ];


let owner, env;


module( "data/models/twitch/game-top", {
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
