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
import { Service } from "ember";
import Subscription from "models/twitch/Subscription";
import SubscriptionSerializer from "models/twitch/SubscriptionSerializer";
import Channel from "models/twitch/Channel";
import ChannelSerializer from "models/twitch/ChannelSerializer";
import TwitchAdapter from "store/TwitchAdapter";
import TwitchSubscriptionFixtures from "fixtures/models/twitch/Subscription.json";


let owner, env;


module( "models/twitch/Subscription", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend({
			session: {
				user_id: 1337
			}
		}) );
		owner.register( "model:twitch-subscription", Subscription );
		owner.register( "serializer:twitch-subscription", SubscriptionSerializer );
		owner.register( "model:twitch-channel", Channel );
		owner.register( "serializer:twitch-channel", ChannelSerializer );

		env = setupStore( owner, { adapter: TwitchAdapter } );
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "Adapter and Serializer", assert => {

	env.adapter.ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchSubscriptionFixtures, url, method, query );

	return env.store.findRecord( "twitchSubscription", 1 )
		.then( record => {
			assert.deepEqual(
				record.toJSON({ includeId: true }),
				{
					id: "1",
					created_at: "2000-01-01T00:00:00.000Z"
				},
				"Has the correct model id and attributes"
			);

			assert.ok(
				env.store.hasRecordForId( "twitchSubscription", 1 ),
				"Has the new Subscription record registered in the data store"
			);
		});

});
