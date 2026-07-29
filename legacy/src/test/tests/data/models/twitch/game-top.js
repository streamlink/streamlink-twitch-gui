import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { adapterRequestFactory, assertRelationships, setupStore } from "store-utils";

import Model from "ember-data/model";

import TwitchAdapter from "data/models/twitch/adapter";
import TwitchGameTop from "data/models/twitch/game-top/model";
import TwitchGameTopSerializer from "data/models/twitch/game-top/serializer";
import TwitchGameTopFixtures from "fixtures/data/models/twitch/game-top.yml";


module( "data/models/twitch/game-top", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			TwitchGameTop,
			TwitchGameTopSerializer,
			TwitchGame: Model.extend()
		})
	});

	hooks.beforeEach(function() {
		setupStore( this.owner, { adapter: TwitchAdapter } );
	});


	test( "Model relationships", function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		/** @type {TwitchGameTop} */
		const model = store.modelFor( "twitch-game-top" );

		assertRelationships( assert, model, [
			{
				key: "game",
				kind: "belongsTo",
				type: "twitch-game",
				options: { async: false }
			}
		]);
	});

	test( "query", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "twitch-game-top" ).ajax
			= adapterRequestFactory( assert, TwitchGameTopFixtures );

		const records = await store.query( "twitch-game-top", {} );

		assert.propEqual(
			records.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "1",
					game: "1"
				},
				{
					id: "2",
					game: "2"
				}
			],
			"Records have the correct IDs and relationship IDs"
		);
		assert.propEqual(
			store.peekAll( "twitch-game-top" ).mapBy( "id" ),
			[ "1", "2" ],
			"Has all TwitchGameTop records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-game" ).mapBy( "id" ),
			[ "1", "2" ],
			"Has all TwitchGame records registered in the data store"
		);
	});
});
