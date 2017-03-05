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
import {
	get,
	Service
} from "Ember";
import GameFollowedLive from "models/twitch/GameFollowedLive";
import GameFollowedLiveSerializer from "models/twitch/GameFollowedLiveSerializer";
import GameFollowed from "models/twitch/GameFollowed";
import GameFollowedSerializer from "models/twitch/GameFollowedSerializer";
import Game from "models/twitch/Game";
import GameSerializer from "models/twitch/GameSerializer";
import imageInjector from "inject-loader?config!models/twitch/Image";
import ImageSerializer from "models/twitch/ImageSerializer";
import TwitchAdapter from "store/TwitchAdapter";
import TwitchGameFollowedLiveFixtures from "fixtures/models/twitch/GameFollowedLive.json";


const TwitchImage = imageInjector({
	config: {
		vars: {}
	}
})[ "default" ];


let owner, env;


module( "models/twitch/GameFollowedLive", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend({
			session: {
				user_name: "foobar"
			}
		}) );
		owner.register( "model:twitch-game-followed-live", GameFollowedLive );
		owner.register( "serializer:twitch-game-followed-live", GameFollowedLiveSerializer );
		owner.register( "model:twitch-game-followed", GameFollowed );
		owner.register( "serializer:twitch-game-followed", GameFollowedSerializer );
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
		adapterRequest( assert, TwitchGameFollowedLiveFixtures, url, method, query );

	return env.store.query( "twitchGameFollowedLive", {} )
		.then( records => {
			assert.strictEqual(
				get( records, "length" ),
				2,
				"Returns all records"
			);

			assert.strictEqual(
				get( records, "meta.total" ),
				1000,
				"Recordarray has metadata with total number of live games followed"
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
				   env.store.hasRecordForId( "twitchGameFollowedLive", "Game A" )
				&& env.store.hasRecordForId( "twitchGameFollowedLive", "Game B" ),
				"Has all GameFollowedLive records registered in the data store"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchGameFollowed", "Game A" )
				&& env.store.hasRecordForId( "twitchGameFollowed", "Game B" ),
				"Has all GameFollowed records registered in the data store"
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
