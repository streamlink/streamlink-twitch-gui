import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { adapterRequestFactory, setupStore } from "store-utils";
import sinon from "sinon";

import TwitchGame from "data/models/twitch/game/model";
import TwitchGameAdapter from "data/models/twitch/game/adapter";
import TwitchGameSerializer from "data/models/twitch/game/serializer";
import TwitchGameFixtures from "fixtures/data/models/twitch/game.yml";
import TwitchImageTransform from "data/transforms/twitch/image";


module( "data/models/twitch/game", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			TwitchGame,
			TwitchGameAdapter,
			TwitchGameSerializer,
			TwitchImageTransform
		})
	});

	hooks.beforeEach(function() {
		this.fakeTimer = sinon.useFakeTimers({
			toFake: [ "Date" ],
			global: window
		});

		setupStore( this.owner );
	});

	hooks.afterEach(function() {
		this.fakeTimer.restore();
	});


	test( "findRecord", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		const responseStub = adapterRequestFactory( assert, TwitchGameFixtures );
		store.adapterFor( "twitch-game" ).ajax = responseStub;

		/** @type {TwitchGame[]} */
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
					box_art_url: "https://mock/twitch-game/1/box_art-285x380.png"
				},
				{
					id: "2",
					name: "another game",
					box_art_url: "https://mock/twitch-game/2/box_art-285x380.png"
				}
			],
			"Records have correct IDs and attributes"
		);
		assert.propEqual(
			store.peekAll( "twitch-game" ).mapBy( "id" ),
			[ "1", "2" ],
			"Has all TwitchGame records registered in the store"
		);

		this.fakeTimer.setSystemTime( 1234 );
		assert.equal(
			records[0].box_art_url,
			"https://mock/twitch-game/1/box_art-285x380.png",
			"Has the correct URL for the box art image"
		);
		assert.strictEqual(
			records[0].box_art_url.latest,
			"https://mock/twitch-game/1/box_art-285x380.png",
			"Doesn't set an expiration date parameter"
		);

		this.fakeTimer.tick( 60000 );
		assert.strictEqual(
			records[0].box_art_url.latest,
			"https://mock/twitch-game/1/box_art-285x380.png",
			"Never sets an expiration date parameter"
		);

		await Promise.all([
			store.findRecord( "twitch-game", 1 ),
			store.findRecord( "twitch-game", 2 )
		]);
		assert.strictEqual( responseStub.callCount, 1, "Does not refresh cached records" );
	});
});
