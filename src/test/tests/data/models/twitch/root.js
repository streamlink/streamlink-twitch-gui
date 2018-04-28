import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import Service from "@ember/service";

import Root from "data/models/twitch/root/model";
import RootSerializer from "data/models/twitch/root/serializer";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchRootFixtures from "fixtures/data/models/twitch/root.json";


let owner, env;


module( "data/models/twitch/root", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend() );
		owner.register( "model:twitch-root", Root );
		owner.register( "serializer:twitch-root", RootSerializer );

		env = setupStore( owner, { adapter: TwitchAdapter } );
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "Adapter and Serializer", assert => {

	env.adapter.ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchRootFixtures, url, method, query );

	return env.store.queryRecord( "twitchRoot", {} )
		.then( record => {
			assert.deepEqual(
				record.toJSON({ includeId: true }),
				{
					id: "1",
					created_at: "2000-01-01T00:00:00.000Z",
					scopes: [
						"chat_login",
						"user_blocks_edit",
						"user_blocks_read",
						"user_follows_edit",
						"user_read",
						"user_subscriptions"
					],
					updated_at: "2000-01-01T00:00:00.000Z",
					user_id: 1337,
					user_name: "user",
					valid: true
				},
				"Has all the attributes"
			);
		});

});
