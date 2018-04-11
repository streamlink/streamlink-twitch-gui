import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import { get } from "@ember/object";
import Service from "@ember/service";

import GameFollowed from "data/models/twitch/game-followed/model";
import GameFollowedSerializer from "data/models/twitch/game-followed/serializer";
import Game from "data/models/twitch/game/model";
import GameSerializer from "data/models/twitch/game/serializer";
import imageInjector from "inject-loader?config!data/models/twitch/image/model";
import ImageSerializer from "data/models/twitch/image/serializer";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchGameFollowedFixtures from "fixtures/data/models/twitch/game-followed.json";


const TwitchImage = imageInjector({
	config: {
		vars: {}
	}
})[ "default" ];


let owner, env;


module( "data/models/twitch/game-followed", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend({
			session: {
				user_name: "foobar"
			}
		}) );
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


test( "Adapter and Serializer (single)", async function( assert ) {

	env.store.adapterFor( "twitchGameFollowed" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchGameFollowedFixtures[ "single" ], url, method, query );

	const record = await env.store.findRecord( "twitchGameFollowed", "some game" );

	assert.propEqual(
		record.toJSON({ includeId: true }),
		{
			id: "some game",
			game: "some game"
		},
		"Record has the correct id and attributes"
	);
	assert.propEqual(
		env.store.peekAll( "twitchGameFollowed" ).mapBy( "id" ),
		[ "some game" ],
		"Has all GameFollowed records registered in the data store"
	);
	assert.propEqual(
		env.store.peekAll( "twitchGame" ).mapBy( "id" ),
		[ "some game" ],
		"Has all Game records registered in the data store"
	);
	assert.propEqual(
		env.store.peekAll( "twitchImage" ).mapBy( "id" ),
		[
			"game/box/some game",
			"game/logo/some game"
		],
		"Has all image records registered in the data store"
	);

});


test( "Adapter and Serializer (many)", async function( assert ) {

	env.store.adapterFor( "twitchGameFollowed" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchGameFollowedFixtures[ "many" ], url, method, query );

	const records = await env.store.query( "twitchGameFollowed", {} );

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
	assert.propEqual(
		env.store.peekAll( "twitchGameFollowed" ).mapBy( "id" ),
		[ "game a", "game b" ],
		"Has all GameFollowed records registered in the data store"
	);
	assert.propEqual(
		env.store.peekAll( "twitchGame" ).mapBy( "id" ),
		[ "game a", "game b" ],
		"Has all Game records registered in the data store"
	);
	assert.propEqual(
		env.store.peekAll( "twitchImage" ).mapBy( "id" ),
		[
			"game/box/game a",
			"game/logo/game a",
			"game/box/game b",
			"game/logo/game b"
		],
		"Has all image records registered in the data store"
	);

});


test( "Create and delete records", async function( assert ) {

	const { create: fixturesCreate, delete: fixturesDelete } = TwitchGameFollowedFixtures;
	const adapter = env.store.adapterFor( "twitchGameFollowed" );

	adapter.ajax = ( ...args ) => adapterRequest( assert, fixturesCreate, ...args );
	const record = await env.store.createRecord( "twitchGameFollowed", { id: "new game" } ).save();

	assert.propEqual(
		record.toJSON({ includeId: true }),
		{
			id: "new game",
			game: "new game"
		},
		"Record has the correct id and attributes"
	);
	assert.propEqual(
		env.store.peekAll( "twitchGameFollowed" ).mapBy( "id" ),
		[ "new game" ],
		"Has the new GameFollowed record registered in the data store"
	);
	assert.propEqual(
		env.store.peekAll( "twitchGame" ).mapBy( "id" ),
		[ "new game" ],
		"Has the Game record registered in the data store"
	);
	assert.propEqual(
		env.store.peekAll( "twitchImage" ).mapBy( "id" ),
		[ "game/box/new game", "game/logo/new game" ],
		"Has all image records registered in the data store"
	);

	adapter.ajax = ( ...args ) => adapterRequest( assert, fixturesDelete, ...args );
	await record.destroyRecord();

	assert.propEqual(
		env.store.peekAll( "twitchGameFollowed" ).mapBy( "id" ),
		[],
		"Has the new GameFollowed record registered in the data store"
	);
	assert.propEqual(
		env.store.peekAll( "twitchGame" ).mapBy( "id" ),
		[ "new game" ],
		"Has the Game record registered in the data store"
	);
	assert.propEqual(
		env.store.peekAll( "twitchImage" ).mapBy( "id" ),
		[ "game/box/new game", "game/logo/new game" ],
		"Has all image records registered in the data store"
	);

});
