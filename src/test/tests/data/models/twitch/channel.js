import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { adapterRequestFactory, setupStore } from "store-utils";

import TwitchChannel from "data/models/twitch/channel/model";
import TwitchChannelAdapter from "data/models/twitch/channel/adapter";
import TwitchChannelSerializer from "data/models/twitch/channel/serializer";
import TwitchChannelFixtures from "fixtures/data/models/twitch/channel.yml";


module( "data/models/twitch/channel", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			TwitchChannel,
			TwitchChannelAdapter,
			TwitchChannelSerializer
		})
	});

	hooks.beforeEach(function() {
		setupStore( this.owner );
	});


	test( "Model relationships", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		/** @type {TwitchChannel} */
		const model = store.modelFor( "twitch-channel" );

		assert.propEqual(
			Array.from( model.relationshipsByName.values() ),
			[],
			"Does not have any relationships"
		);
	});

	test( "findRecord", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		const responseStub = adapterRequestFactory( assert, TwitchChannelFixtures );
		store.adapterFor( "twitch-channel" ).ajax = responseStub;

		const records = await Promise.all([
			store.findRecord( "twitch-channel", "11" ),
			store.findRecord( "twitch-channel", "21" )
		]);

		assert.propEqual(
			records.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "11",
					broadcaster_language: "en",
					delay: 90
				},
				{
					id: "21",
					broadcaster_language: "de",
					delay: 0
				}
			],
			"Records have correct IDs and attributes"
		);
		assert.strictEqual(
			responseStub.callCount,
			1,
			"Only queries API once"
		);
	});
});
