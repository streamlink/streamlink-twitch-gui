import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { adapterRequestFactory, setupStore } from "store-utils";

import TwitchAdapter from "data/models/twitch/adapter";
import TwitchSearchGame from "data/models/twitch/search-game/model";
import TwitchSearchGameSerializer from "data/models/twitch/search-game/serializer";
import TwitchSearchGameFixtures from "fixtures/data/models/twitch/search-game.yml";
import TwitchGame from "data/models/twitch/game/model";
import TwitchGameSerializer from "data/models/twitch/game/serializer";


module( "data/models/twitch/search-game", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			TwitchSearchGame,
			TwitchSearchGameSerializer,
			TwitchGame,
			TwitchGameSerializer
		})
	});

	hooks.beforeEach(function() {
		setupStore( this.owner, { adapter: TwitchAdapter } );
	});


	test( "Adapter and Serializer", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "twitch-search-game" ).ajax
			= adapterRequestFactory( assert, TwitchSearchGameFixtures );

		const records = await store.query( "twitch-search-game", { query: "foo" } );

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
			store.peekAll( "twitch-search-game" ).mapBy( "id" ),
			[ "1", "2" ],
			"Has all TwitchSearchGame records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-game" ).mapBy( "id" ),
			[ "1", "2" ],
			"Has all TwitchGame records registered in the data store"
		);
	});
});
