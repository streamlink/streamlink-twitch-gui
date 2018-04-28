import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import Service from "@ember/service";

import SearchGame from "data/models/twitch/search-game/model";
import SearchGameSerializer from "data/models/twitch/search-game/serializer";
import Game from "data/models/twitch/game/model";
import GameSerializer from "data/models/twitch/game/serializer";
import imageInjector from "inject-loader?config!data/models/twitch/image/model";
import ImageSerializer from "data/models/twitch/image/serializer";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchSearchGameFixtures from "fixtures/data/models/twitch/search-game.json";


const TwitchImage = imageInjector({
	config: {
		vars: {}
	}
})[ "default" ];


let owner, env;


module( "data/models/twitch/search-game", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend() );
		owner.register( "model:twitch-search-game", SearchGame );
		owner.register( "serializer:twitch-search-game", SearchGameSerializer );
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
		adapterRequest( assert, TwitchSearchGameFixtures, url, method, query );

	return env.store.query( "twitchSearchGame", { query: "foo" } )
		.then( records => {
			assert.deepEqual(
				records.map( record => record.toJSON({ includeId: true }) ),
				[
					{
						id: "foo",
						game: "foo"
					},
					{
						id: "foobar",
						game: "foobar"
					}
				],
				"Models have the correct id and attributes"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchGame", "foo" )
				&& env.store.hasRecordForId( "twitchGame", "foobar" ),
				"Has all Game records registered in the data store"
			);
			assert.ok(
				   env.store.hasRecordForId( "twitchImage", "game/box/foo" )
				&& env.store.hasRecordForId( "twitchImage", "game/logo/foo" )
				&& env.store.hasRecordForId( "twitchImage", "game/box/foobar" )
				&& env.store.hasRecordForId( "twitchImage", "game/logo/foobar" ),
				"Has all Image records registered in the data store"
			);
		});

});
