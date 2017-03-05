import {
	module,
	test
} from "QUnit";
import {
	buildOwner,
	runDestroy
} from "Testutils";
import { setupStore } from "Store";
import ProductEmoticon from "models/twitch/ProductEmoticon";
import ProductEmoticonSerializer from "models/twitch/ProductEmoticonSerializer";
import TwitchProductEmoticonFixtures from "fixtures/models/twitch/ProductEmoticon.json";


let owner, env;


module( "models/twitch/ProductEmoticon", {
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

	env.adapter.findRecord = () =>
		Promise.resolve({
			twitchProductEmoticon: TwitchProductEmoticonFixtures[ "embedded" ]
		});

	return env.store.findRecord( "twitchProductEmoticon", 1 )
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
