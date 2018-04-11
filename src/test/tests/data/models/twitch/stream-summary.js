import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import Service from "@ember/service";

import StreamSummary from "data/models/twitch/stream-summary/model";
import StreamSummarySerializer from "data/models/twitch/stream-summary/serializer";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchStreamSummaryFixtures from "fixtures/data/models/twitch/stream-summary.json";


let owner, env;


module( "data/models/twitch/stream-summary", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend() );
		owner.register( "model:twitch-stream-summary", StreamSummary );
		owner.register( "serializer:twitch-stream-summary", StreamSummarySerializer );

		env = setupStore( owner, { adapter: TwitchAdapter } );
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "Adapter and Serializer", assert => {

	env.adapter.ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchStreamSummaryFixtures, url, method, query );

	return env.store.queryRecord( "twitchStreamSummary", {} )
		.then( record => {
			assert.deepEqual(
				record.toJSON({ includeId: true }),
				{
					id: "1",
					channels: 10000,
					viewers: 1000000
				},
				"Has all the attributes"
			);
		});

});
