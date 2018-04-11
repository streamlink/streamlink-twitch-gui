import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore } from "store-utils";

import ProductEmoticon from "data/models/twitch/product-emoticon/model";
import ProductEmoticonSerializer from "data/models/twitch/product-emoticon/serializer";
import TwitchProductEmoticonFixtures from "fixtures/data/models/twitch/product-emoticon.json";


let owner, env;


module( "data/models/twitch/product-emoticon", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "model:twitch-product-emoticon", ProductEmoticon );
		owner.register( "serializer:twitch-product-emoticon", ProductEmoticonSerializer.extend({
			modelNameFromPayloadKey() {
				return "twitchProductEmoticon";
			}
		}) );

		env = setupStore( owner );
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "Serializer", assert => {

	// TwitchProductEmoticon is just an embedded model
	// ignore the queried record id

	env.adapter.queryRecord = () =>
		Promise.resolve({
			twitchProductEmoticon: TwitchProductEmoticonFixtures[ "embedded" ]
		});

	return env.store.queryRecord( "twitchProductEmoticon", 1 )
		.then( record => {
			assert.deepEqual(
				record.toJSON({ includeId: true }),
				{
					id: "foo",
					regex: "foo",
					regex_display: null,
					state: "active",
					url: "foo.png"
				},
				"Has the correct model attributes"
			);
		});

});
