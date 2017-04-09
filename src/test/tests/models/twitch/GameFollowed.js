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
import GameFollowed from "models/twitch/GameFollowed";
import GameFollowedAdapter from "models/twitch/GameFollowedAdapter";
import GameFollowedSerializer from "models/twitch/GameFollowedSerializer";
import Game from "models/twitch/Game";
import GameSerializer from "models/twitch/GameSerializer";
import imageInjector from "inject-loader?config!models/twitch/Image";
import ImageSerializer from "models/twitch/ImageSerializer";
import TwitchGameFollowedFixtures from "fixtures/models/twitch/GameFollowed.json";


const TwitchImage = imageInjector({
	config: {
		vars: {}
	}
})[ "default" ];


let owner, env;


module( "models/twitch/GameFollowed", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend({
			session: {
				user_name: "foobar"
			}
		}) );
		owner.register( "model:twitch-game-followed", GameFollowed );
		owner.register( "adapter:twitch-game-followed", GameFollowedAdapter );
		owner.register( "serializer:twitch-game-followed", GameFollowedSerializer );
		owner.register( "model:twitch-game", Game );
		owner.register( "serializer:twitch-game", GameSerializer );
		owner.register( "model:twitch-image", TwitchImage );
		owner.register( "serializer:twitch-image", ImageSerializer );

		env = setupStore( owner );
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "Adapter and Serializer (single)", assert => {

	env.store.adapterFor( "twitchGameFollowed" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchGameFollowedFixtures[ "single" ], url, method, query );

	return env.store.findRecord( "twitchGameFollowed", "some game" )
		.then( record => {
			assert.deepEqual(
				record.toJSON({ includeId: true }),
				{
					id: "some game",
					game: "some game"
				},
				"Record has the correct id and attributes"
			);

			assert.ok(
				env.store.hasRecordForId( "twitchGame", "some game" ),
				"Has the Game record registered in the data store"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchImage", "game/box/some game" )
				&& env.store.hasRecordForId( "twitchImage", "game/logo/some game" ),
				"Has all image records registered in the data store"
			);
		});

});


test( "Adapter and Serializer (many)", assert => {

	env.store.adapterFor( "twitchGameFollowed" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchGameFollowedFixtures[ "many" ], url, method, query );

	return env.store.query( "twitchGameFollowed", {} )
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
						id: "game a",
						game: "game a"
					},
					{
						id: "game b",
						game: "game b"
					}
				],
				"Models have the correct id and attributes"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchGame", "game a" )
				&& env.store.hasRecordForId( "twitchGame", "game b" ),
				"Has all Game records registered in the data store"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchImage", "game/box/game a" )
				&& env.store.hasRecordForId( "twitchImage", "game/logo/game a" )
				&& env.store.hasRecordForId( "twitchImage", "game/box/game b" )
				&& env.store.hasRecordForId( "twitchImage", "game/logo/game b" ),
				"Has all Image records registered in the data store"
			);
		});

});


test( "Create and delete records", assert => {

	let action = "create";

	env.store.adapterFor( "twitchGameFollowed" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchGameFollowedFixtures[ action ], url, method, query );

	return env.store.createRecord( "twitchGameFollowed", { id: "new game" } )
		.save()
		.then( record => {
			assert.deepEqual(
				record.toJSON({ includeId: true }),
				{
					id: "new game",
					game: "new game"
				},
				"Record has the correct id and attributes"
			);

			assert.ok(
				env.store.hasRecordForId( "twitchGameFollowed", "new game" ),
				"Has the new GameFollowed record registered in the data store"
			);

			assert.ok(
				env.store.hasRecordForId( "twitchGame", "new game" ),
				"Has the Game record registered in the data store"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchImage", "game/box/new game" )
				&& env.store.hasRecordForId( "twitchImage", "game/logo/new game" ),
				"Has all image records registered in the data store"
			);


			action = "delete";

			return record.destroyRecord();
		})
		.then( () => {
			assert.ok(
				!env.store.hasRecordForId( "twitchGameFollowed", "new game" ),
				"Does not have the new GameFollowed record registered in the data store anymore"
			);

			assert.ok(
				env.store.hasRecordForId( "twitchGame", "new game" ),
				"Still has the Game record registered in the data store"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchImage", "game/box/new game" )
				&& env.store.hasRecordForId( "twitchImage", "game/logo/new game" ),
				"Still has all image records registered in the data store"
			);
		});

});
