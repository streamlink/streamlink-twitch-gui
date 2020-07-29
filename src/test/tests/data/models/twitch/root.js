import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";

import Service from "@ember/service";

import ModelFragmentsInitializer from "init/initializers/model-fragments";
import TwitchRoot from "data/models/twitch/root/model";
import TwitchRootSerializer from "data/models/twitch/root/serializer";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchRootFixtures from "fixtures/data/models/twitch/root.json";


module( "data/models/twitch/root", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			TwitchRoot,
			TwitchRootSerializer,
			AuthService: Service
		})
	});

	hooks.beforeEach(function() {
		ModelFragmentsInitializer.initialize( this.owner );
		setupStore( this.owner, { adapter: TwitchAdapter } );
	});


	test( "Adapter and Serializer", async function( assert ) {
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "twitch-root" ).ajax = ( ...args ) =>
			adapterRequest( assert, TwitchRootFixtures[ "valid" ], ...args );

		const record = await store.queryRecord( "twitch-root", {} );
		assert.propEqual(
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
