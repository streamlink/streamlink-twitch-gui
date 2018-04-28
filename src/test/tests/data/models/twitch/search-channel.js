import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import { I18nService } from "i18n-utils";
import Service from "@ember/service";

import SearchChannel from "data/models/twitch/search-channel/model";
import SearchChannelSerializer from "data/models/twitch/search-channel/serializer";
import Channel from "data/models/twitch/channel/model";
import ChannelSerializer from "data/models/twitch/channel/serializer";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchSearchChannelFixtures from "fixtures/data/models/twitch/search-channel.json";


let owner, env;


module( "data/models/twitch/search-channel", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend() );
		owner.register( "service:i18n", I18nService );
		owner.register( "model:twitch-search-channel", SearchChannel );
		owner.register( "serializer:twitch-search-channel", SearchChannelSerializer );
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
		adapterRequest( assert, TwitchSearchChannelFixtures, url, method, query );

	return env.store.query( "twitchSearchChannel", { query: "foo" } )
		.then( records => {
			assert.deepEqual(
				records.map( record => record.toJSON({ includeId: true }) ),
				[
					{
						id: "1",
						channel: "1"
					},
					{
						id: "2",
						channel: "2"
					}
				],
				"Models have the correct id and attributes"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchChannel", "1" )
				&& env.store.hasRecordForId( "twitchChannel", "2" ),
				"Has all Channel records registered in the data store"
			);
		});

});
