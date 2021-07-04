import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import { FakeIntlService } from "intl-utils";

import Service from "@ember/service";

import TwitchChannelFollowed from "data/models/twitch/channel-followed/model";
import TwitchChannelFollowedSerializer from "data/models/twitch/channel-followed/serializer";
import TwitchChannel from "data/models/twitch/channel/model";
import TwitchChannelSerializer from "data/models/twitch/channel/serializer";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchChannelFollowedFixtures from "fixtures/data/models/twitch/channel-followed.json";


module( "data/models/twitch/channel-followed", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			TwitchChannel,
			TwitchChannelSerializer,
			TwitchChannelFollowed,
			TwitchChannelFollowedSerializer,
			IntlService: FakeIntlService,
			SettingsService: Service.extend()
		})
	});

	hooks.beforeEach(function() {
		this.owner.register( "service:auth", Service.extend({
			session: {
				user_id: 1337
			}
		}) );

		this.env = setupStore( this.owner, { adapter: TwitchAdapter } );
	});


	test( "Adapter and Serializer (single)", async function( assert ) {
		this.env.adapter.ajax = ( url, method, query ) =>
			adapterRequest( assert, TwitchChannelFollowedFixtures[ "single" ], url, method, query );

		const record = await this.env.store.findRecord( "twitch-channel-followed", 1 );

		assert.propEqual(
			record.toJSON({ includeId: true }),
			{
				id: "1",
				channel: null,
				created_at: "2000-01-01T00:00:00.000Z",
				notifications: false
			},
			"Models have the correct id and attributes"
		);
		assert.propEqual(
			this.env.store.peekAll( "twitch-channel-followed" ).mapBy( "id" ),
			[ "1" ],
			"Has all TwitchChannelFollowed records registered in the data store"
		);
		assert.propEqual(
			this.env.store.peekAll( "twitch-channel" ).mapBy( "id" ),
			[],
			"Doesn't have any TwitchChannel records registered in the data store"
		);
	});

	test( "Adapter and Serializer (many)", async function( assert ) {
		this.env.adapter.ajax = ( url, method, query ) =>
			adapterRequest( assert, TwitchChannelFollowedFixtures[ "many" ], url, method, query );

		const records = await this.env.store.query( "twitch-channel-followed", {} );

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
			this.env.store.peekAll( "twitch-channel-followed" ).mapBy( "id" ),
			[ "1", "2" ],
			"Has all TwitchChannelFollowed records registered in the data store"
		);
		assert.propEqual(
			this.env.store.peekAll( "twitch-channel" ).mapBy( "id" ),
			[ "1", "2" ],
			"Has all TwitchChannel records registered in the data store"
		);
	});

	test( "Create and delete records", async function( assert ) {
		const { create: fixturesCreate, delete: fixturesDelete } = TwitchChannelFollowedFixtures;

		this.env.adapter.ajax = ( ...args ) => adapterRequest( assert, fixturesCreate, ...args );
		const record = this.env.store.createRecord( "twitch-channel-followed", { id: 1 } );
		await record.save();

		assert.propEqual(
			record.toJSON({ includeId: true }),
			{
				id: "1",
				channel: null,
				created_at: "2000-01-01T00:00:00.000Z",
				notifications: false
			},
			"Record has the correct id and attributes"
		);
		assert.propEqual(
			this.env.store.peekAll( "twitch-channel-followed" ).mapBy( "id" ),
			[ "1" ],
			"Has the new record registered in the data store"
		);

		this.env.adapter.ajax = ( ...args ) => adapterRequest( assert, fixturesDelete, ...args );
		await record.destroyRecord();

		assert.propEqual(
			this.env.store.peekAll( "twitch-channel-followed" ).mapBy( "id" ),
			[],
			"Does not have the new record registered in the data store anymore"
		);
	});

});
