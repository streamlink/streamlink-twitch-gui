import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import { get } from "@ember/object";
import Service from "@ember/service";

import CommunityTop from "data/models/twitch/community-top/model";
import CommunityTopSerializer from "data/models/twitch/community-top/serializer";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchCommunityTopFixtures from "fixtures/data/models/twitch/community-top.json";


let owner, env;


module( "data/models/twitch/community-top", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend() );
		owner.register( "model:twitch-community-top", CommunityTop );
		owner.register( "serializer:twitch-community-top", CommunityTopSerializer );

		env = setupStore( owner, { adapter: TwitchAdapter } );
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "Adapter and Serializer", assert => {

	env.store.adapterFor( "twitchCommunityTop" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchCommunityTopFixtures, url, method, query );

	return env.store.query( "twitchCommunityTop", {} )
		.then( records => {
			assert.deepEqual(
				records.map( record => record.toJSON({ includeId: true }) ),
				[
					{
						id: "deadbeef-1337-4444-beef-1337deadbeef",
						avatar_image_url: "avatar-1",
						channels: 100,
						name: "First community",
						viewers: 100
					},
					{
						id: "deadc0de-1337-4444-beef-1337deadc0de",
						avatar_image_url: "avatar-2",
						channels: 10,
						name: "Second community",
						viewers: 10
					}
				],
				"All models have the correct id and attributes"
			);

			assert.strictEqual(
				get( records, "meta.cursor" ),
				"foo",
				"Recordarray has cursor metadata"
			);

			assert.strictEqual(
				get( records, "meta.total" ),
				1000,
				"Recordarray has metadata with total number of streams"
			);

			assert.deepEqual(
				env.store.peekAll( "twitchCommunityTop" ).mapBy( "id" ),
				[
					"deadbeef-1337-4444-beef-1337deadbeef",
					"deadc0de-1337-4444-beef-1337deadc0de"
				],
				"Does have all CommunityTop records registered in the data store"
			);
		});

});
