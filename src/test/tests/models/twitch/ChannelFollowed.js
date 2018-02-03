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
import Service from "@ember/service";
import ChannelFollowed from "models/twitch/ChannelFollowed";
import ChannelFollowedSerializer from "models/twitch/ChannelFollowedSerializer";
import Channel from "models/twitch/Channel";
import ChannelSerializer from "models/twitch/ChannelSerializer";
import TwitchAdapter from "store/TwitchAdapter";
import TwitchChannelFollowedFixtures from "fixtures/models/twitch/ChannelFollowed.json";


let owner, env;


module( "models/twitch/ChannelFollowed", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend({
			session: {
				user_id: 1337
			}
		}) );
		owner.register( "model:twitch-channel-followed", ChannelFollowed );
		owner.register( "serializer:twitch-channel-followed", ChannelFollowedSerializer );
		owner.register( "model:twitch-channel", Channel );
		owner.register( "serializer:twitch-channel", ChannelSerializer );

		env = setupStore( owner, { adapter: TwitchAdapter } );
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "Adapter and Serializer (single)", assert => {

	env.adapter.ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchChannelFollowedFixtures[ "single" ], url, method, query );

	return env.store.findRecord( "twitchChannelFollowed", 1 )
		.then( record => {
			assert.deepEqual(
				record.toJSON({ includeId: true }),
				{
					id: "1",
					channel: "1",
					created_at: "2000-01-01T00:00:00.000Z",
					notifications: false
				},
				"Models have the correct id and attributes"
			);

			assert.ok(
				env.store.hasRecordForId( "twitchChannelFollowed", "1" ),
				"Has all ChannelFollowed records registered in the data store"
			);

			assert.ok(
				env.store.hasRecordForId( "twitchChannel", "1" ),
				"Has all Channel records registered in the data store"
			);
		});

});


test( "Adapter and Serializer (many)", assert => {

	env.adapter.ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchChannelFollowedFixtures[ "many" ], url, method, query );

	return env.store.query( "twitchChannelFollowed", {} )
		.then( records => {
			assert.deepEqual(
				records.map( record => record.toJSON({ includeId: true }) ),
				[
					{
						id: "1",
						channel: "1",
						created_at: "2000-01-01T00:00:00.000Z",
						notifications: false
					},
					{
						id: "2",
						channel: "2",
						created_at: "2000-01-01T00:00:00.000Z",
						notifications: true
					}
				],
				"Models have the correct id and attributes"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchChannelFollowed", "1" )
				&& env.store.hasRecordForId( "twitchChannelFollowed", "2" ),
				"Has all ChannelFollowed records registered in the data store"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchChannel", "1" )
				&& env.store.hasRecordForId( "twitchChannel", "2" ),
				"Has all Channel records registered in the data store"
			);
		});

});


test( "Create and delete records", assert => {

	let action = "create";

	env.adapter.ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchChannelFollowedFixtures[ action ], url, method, query );

	return env.store.createRecord( "twitchChannelFollowed", { id: 1 } )
		.save()
		.then( record => {
			assert.deepEqual(
				record.toJSON({ includeId: true }),
				{
					id: "1",
					channel: "1",
					created_at: "2000-01-01T00:00:00.000Z",
					notifications: false
				},
				"Record has the correct id and attributes"
			);

			assert.ok(
				env.store.hasRecordForId( "twitchChannelFollowed", 1 ),
				"Has the new ChannelFollowed record registered in the data store"
			);

			assert.ok(
				env.store.hasRecordForId( "twitchChannel", 1 ),
				"Has the Channel record registered in the data store"
			);


			action = "delete";

			return record.destroyRecord();
		})
		.then( () => {
			assert.ok(
				!env.store.hasRecordForId( "twitchChannelFollowed", 1 ),
				"Does not have the new ChannelFollowed record registered in the data store anymore"
			);

			assert.ok(
				env.store.hasRecordForId( "twitchChannel", 1 ),
				"Still has the Channel record registered in the data store"
			);
		});

});
