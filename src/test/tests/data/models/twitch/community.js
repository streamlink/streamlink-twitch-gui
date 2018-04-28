import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import { I18nService } from "i18n-utils";
import { get } from "@ember/object";
import Service from "@ember/service";

import Community from "data/models/twitch/community/model";
import CommunitySerializer from "data/models/twitch/community/serializer";
import Channel from "data/models/twitch/channel/model";
import ChannelSerializer from "data/models/twitch/channel/serializer";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchCommunityFixtures from "fixtures/data/models/twitch/community.json";
import TwitchChannelFixtures from "fixtures/data/models/twitch/channel.json";


let owner, env;


module( "data/models/twitch/community", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend() );
		owner.register( "service:i18n", I18nService );
		owner.register( "service:settings", Service.extend() );
		owner.register( "model:twitch-community", Community );
		owner.register( "adapter:twitch-community", TwitchAdapter.extend() );
		owner.register( "serializer:twitch-community", CommunitySerializer );
		owner.register( "model:twitch-channel", Channel );
		owner.register( "adapter:twitch-channel", TwitchAdapter.extend() );
		owner.register( "serializer:twitch-channel", ChannelSerializer );

		env = setupStore( owner );
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "Adapter and Serializer", assert => {

	env.store.adapterFor( "twitchCommunity" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchCommunityFixtures[ "by-id" ], url, method, query );

	env.store.adapterFor( "twitchChannel" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchChannelFixtures[ "by-id" ], url, method, query );

	return env.store.findRecord( "twitchCommunity", "deadbeef-1337-4444-beef-1337deadbeef" )
		.then( record => {
			assert.deepEqual(
				record.toJSON({ includeId: true }),
				{
					id: "deadbeef-1337-4444-beef-1337deadbeef",
					owner: "1",
					name: "Test community",
					summary: "A community for testing the model, adapter and serializer",
					description: "HTML description",
					rules: "HTML rules",
					language: "en",
					avatar_image_url: "avatar",
					cover_image_url: "cover"
				},
				"Has the correct model id and attributes"
			);

			assert.ok(
				env.store.hasRecordForId(
					"twitchCommunity",
					"deadbeef-1337-4444-beef-1337deadbeef"
				),
				"Has Community record registered in the data store"
			);
			assert.deepEqual(
				get( env.store.peekAll( "twitchChannel" ), "length" ),
				0,
				"Does not have any Channel records registered in the data store"
			);

			return get( record, "owner" )
				.then( () => {
					assert.ok(
						env.store.hasRecordForId( "twitchChannel", 1 ),
						"Has the Channel record registered in the data store"
					);
				});
		});

});
