import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { adapterRequestFactory, setupStore } from "store-utils";

import TwitchGame from "data/models/twitch/game/model";
import TwitchGameAdapter from "data/models/twitch/game/adapter";
import TwitchGameSerializer from "data/models/twitch/game/serializer";
import TwitchGameFixtures from "fixtures/data/models/twitch/game.yml";


module( "data/models/twitch/game", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			TwitchGame,
			TwitchGameAdapter,
			TwitchGameSerializer
		})
	});

	hooks.beforeEach(function() {
		setupStore( this.owner );
	});


	test( "findRecord", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		const responseStub = adapterRequestFactory( assert, TwitchGameFixtures );
		store.adapterFor( "twitch-game" ).ajax = responseStub;

		const records = await Promise.all([
			store.findRecord( "twitch-game", 1 ),
			store.findRecord( "twitch-game", 2 )
		]);

		assert.propEqual(
			records.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "1",
					name: "some game",
					box_art_url: "https://mock/twitch-game/1/box_art-{width}x{height}.png"
				},
				{
					id: "2",
					name: "another game",
					box_art_url: "https://mock/twitch-game/2/box_art-{width}x{height}.png"
				}
			],
			"Records have correct IDs and attributes"
		);
		assert.propEqual(
			store.peekAll( "twitch-game" ).mapBy( "id" ),
			[ "1", "2" ],
			"Has all TwitchGame records registered in the store"
		);

		await Promise.all([
			store.findRecord( "twitch-game", 1 ),
			store.findRecord( "twitch-game", 2 )
		]);
		assert.strictEqual( responseStub.callCount, 1, "Does not refresh cached records" );
	});
});
