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
import Service from "@ember/service";
import SearchGame from "models/twitch/SearchGame";
import SearchGameSerializer from "models/twitch/SearchGameSerializer";
import Game from "models/twitch/Game";
import GameSerializer from "models/twitch/GameSerializer";
import imageInjector from "inject-loader?config!models/twitch/Image";
import ImageSerializer from "models/twitch/ImageSerializer";
import TwitchAdapter from "store/TwitchAdapter";
import TwitchSearchGameFixtures from "fixtures/models/twitch/SearchGame.json";


const TwitchImage = imageInjector({
	config: {
		vars: {}
	}
})[ "default" ];


let owner, env;


module( "models/twitch/SearchGame", {
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
