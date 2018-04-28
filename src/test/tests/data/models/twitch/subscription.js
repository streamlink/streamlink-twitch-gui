import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import Service from "@ember/service";

import Subscription from "data/models/twitch/subscription/model";
import SubscriptionSerializer from "data/models/twitch/subscription/serializer";
import Channel from "data/models/twitch/channel/model";
import ChannelSerializer from "data/models/twitch/channel/serializer";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchSubscriptionFixtures from "fixtures/data/models/twitch/subscription.json";


let owner, env;


module( "data/models/twitch/subscription", {
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
