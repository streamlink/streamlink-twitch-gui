import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import { I18nService } from "i18n-utils";
import Service from "@ember/service";

import ChannelFollowed from "data/models/twitch/channel-followed/model";
import ChannelFollowedSerializer from "data/models/twitch/channel-followed/serializer";
import Channel from "data/models/twitch/channel/model";
import ChannelSerializer from "data/models/twitch/channel/serializer";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchChannelFollowedFixtures from "fixtures/data/models/twitch/channel-followed.json";


let owner, env;


module( "data/models/twitch/channel-followed", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend({
			session: {
				user_id: 1337
			}
		}) );
		owner.register( "service:i18n", I18nService );
		owner.register( "service:settings", Service.extend() );
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


test( "Adapter and Serializer (single)", async function( assert ) {

	env.adapter.ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchChannelFollowedFixtures[ "single" ], url, method, query );

	const record = await env.store.findRecord( "twitchChannelFollowed", 1 );

	assert.propEqual(
		record.toJSON({ includeId: true }),
		{
			id: "1",
			channel: "1",
			created_at: "2000-01-01T00:00:00.000Z",
			notifications: false
		},
		"Models have the correct id and attributes"
	);
	assert.propEqual(
		env.store.peekAll( "twitchChannelFollowed" ).mapBy( "id" ),
		[ "1" ],
		"Has all ChannelFollowed records registered in the data store"
	);
	assert.propEqual(
		env.store.peekAll( "twitchChannel" ).mapBy( "id" ),
		[ "1" ],
		"Has all Channel records registered in the data store"
	);

});


test( "Adapter and Serializer (many)", async function( assert ) {

	env.adapter.ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchChannelFollowedFixtures[ "many" ], url, method, query );

	const records = await env.store.query( "twitchChannelFollowed", {} );

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
	assert.propEqual(
		env.store.peekAll( "twitchChannelFollowed" ).mapBy( "id" ),
		[ "1", "2" ],
		"Has all ChannelFollowed records registered in the data store"
	);
	assert.propEqual(
		env.store.peekAll( "twitchChannel" ).mapBy( "id" ),
		[ "1", "2" ],
		"Has all Channel records registered in the data store"
	);

});


test( "Create and delete records", async function( assert ) {

	const { create: fixturesCreate, delete: fixturesDelete } = TwitchChannelFollowedFixtures;

	env.adapter.ajax = ( ...args ) => adapterRequest( assert, fixturesCreate, ...args );
	const record = await env.store.createRecord( "twitchChannelFollowed", { id: 1 } ).save();

	assert.propEqual(
		record.toJSON({ includeId: true }),
		{
			id: "1",
			channel: "1",
			created_at: "2000-01-01T00:00:00.000Z",
			notifications: false
		},
		"Record has the correct id and attributes"
	);
	assert.propEqual(
		env.store.peekAll( "twitchChannelFollowed" ).mapBy( "id" ),
		[ "1" ],
		"Has the new ChannelFollowed record registered in the data store"
	);
	assert.propEqual(
		env.store.peekAll( "twitchChannel" ).mapBy( "id" ),
		[ "1" ],
		"Has the Channel record registered in the data store"
	);

	env.adapter.ajax = ( ...args ) => adapterRequest( assert, fixturesDelete, ...args );
	await record.destroyRecord();

	assert.propEqual(
		env.store.peekAll( "twitchChannelFollowed" ).mapBy( "id" ),
		[],
		"Does not have the new ChannelFollowed record registered in the data store anymore"
	);
	assert.propEqual(
		env.store.peekAll( "twitchChannel" ).mapBy( "id" ),
		[ "1" ],
		"Still has the Channel record registered in the data store"
	);

});
