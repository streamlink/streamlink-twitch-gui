import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";

import Service from "@ember/service";

import TwitchGameFollowed from "data/models/twitch/game-followed/model";
import TwitchGameFollowedSerializer from "data/models/twitch/game-followed/serializer";
import TwitchGame from "data/models/twitch/game/model";
import TwitchGameSerializer from "data/models/twitch/game/serializer";
import TwitchImage from "data/models/twitch/image/model";
import TwitchImageSerializer from "data/models/twitch/image/serializer";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchGameFollowedFixtures from "fixtures/data/models/twitch/game-followed.json";


module( "data/models/twitch/game-followed", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			TwitchGameFollowed,
			TwitchGameFollowedSerializer,
			TwitchGame,
			TwitchGameSerializer,
			TwitchImage,
			TwitchImageSerializer
		})
	});

	hooks.beforeEach(function() {
		this.owner.register( "service:auth", Service.extend({
			session: {
				user_name: "foobar"
			}
		}) );

		this.env = setupStore( this.owner, { adapter: TwitchAdapter } );
	});


	test( "Adapter and Serializer (single)", async function( assert ) {
		this.env.store.adapterFor( "twitch-game-followed" ).ajax = ( url, method, query ) =>
			adapterRequest( assert, TwitchGameFollowedFixtures[ "single" ], url, method, query );

		const record = await this.env.store.findRecord( "twitch-game-followed", "some game" );

		assert.propEqual(
			record.toJSON({ includeId: true }),
			{
				id: "some game",
				game: "some game"
			},
			"Record has the correct id and attributes"
		);
		assert.propEqual(
			this.env.store.peekAll( "twitch-game-followed" ).mapBy( "id" ),
			[ "some game" ],
			"Has all TwitchGameFollowed records registered in the data store"
		);
		assert.propEqual(
			this.env.store.peekAll( "twitch-game" ).mapBy( "id" ),
			[ "some game" ],
			"Has all TwitchGame records registered in the data store"
		);
		assert.propEqual(
			this.env.store.peekAll( "twitch-image" ).mapBy( "id" ),
			[
				"game/box/some game",
				"game/logo/some game"
			],
			"Has all TwitchImage records registered in the data store"
		);
	});

	test( "Adapter and Serializer (many)", async function( assert ) {
		this.env.store.adapterFor( "twitch-game-followed" ).ajax = ( url, method, query ) =>
			adapterRequest( assert, TwitchGameFollowedFixtures[ "many" ], url, method, query );

		const records = await this.env.store.query( "twitch-game-followed", {} );

		assert.strictEqual(
			records.length,
			2,
			"Returns all records"
		);
		assert.strictEqual(
			records.meta.total,
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
			this.env.store.peekAll( "twitch-game-followed" ).mapBy( "id" ),
			[ "game a", "game b" ],
			"Has all TwitchGameFollowed records registered in the data store"
		);
		assert.propEqual(
			this.env.store.peekAll( "twitch-game" ).mapBy( "id" ),
			[ "game a", "game b" ],
			"Has all TwitchGame records registered in the data store"
		);
		assert.propEqual(
			this.env.store.peekAll( "twitch-image" ).mapBy( "id" ),
			[
				"game/box/game a",
				"game/logo/game a",
				"game/box/game b",
				"game/logo/game b"
			],
			"Has all TwitchImage records registered in the data store"
		);
	});

	test( "Create and delete records", async function( assert ) {
		const { create: fixturesCreate, delete: fixturesDelete } = TwitchGameFollowedFixtures;
		const adapter = this.env.store.adapterFor( "twitch-game-followed" );

		adapter.ajax = ( ...args ) => adapterRequest( assert, fixturesCreate, ...args );
		const record = this.env.store.createRecord( "twitch-game-followed", { id: "new game" } );
		await record.save();

		assert.propEqual(
			record.toJSON({ includeId: true }),
			{
				id: "new game",
				game: null
			},
			"Record has the correct id and no game relationship"
		);
		assert.propEqual(
			this.env.store.peekAll( "twitch-game-followed" ).mapBy( "id" ),
			[ "new game" ],
			"Has the new record registered in the data store"
		);

		adapter.ajax = ( ...args ) => adapterRequest( assert, fixturesDelete, ...args );
		await record.destroyRecord();

		assert.propEqual(
			this.env.store.peekAll( "twitch-game-followed" ).mapBy( "id" ),
			[],
			"Has the new record registered in the data store"
		);
	});

});
