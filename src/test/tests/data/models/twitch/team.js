import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import { I18nService } from "i18n-utils";
import { get, set } from "@ember/object";
import { run } from "@ember/runloop";
import Service from "@ember/service";

import Team from "data/models/twitch/team/model";
import TeamAdapter from "data/models/twitch/team/adapter";
import TeamSerializer from "data/models/twitch/team/serializer";
import Channel from "data/models/twitch/channel/model";
import ChannelSerializer from "data/models/twitch/channel/serializer";
import TwitchTeamFixtures from "fixtures/data/models/twitch/team.json";


let owner, env;


module( "data/models/twitch/team", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend() );
		owner.register( "service:i18n", I18nService );
		owner.register( "service:settings", Service.extend() );
		owner.register( "model:twitch-team", Team );
		owner.register( "adapter:twitch-team", TeamAdapter );
		owner.register( "serializer:twitch-team", TeamSerializer );
		owner.register( "model:twitch-channel", Channel );
		owner.register( "serializer:twitch-channel", ChannelSerializer );

		env = setupStore( owner );
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "Adapter and Serializer (single)", assert => {

	env.store.adapterFor( "twitchTeam" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchTeamFixtures[ "single" ], url, method, query );

	return env.store.findRecord( "twitchTeam", "foo" )
		.then( record => {
			assert.deepEqual(
			record.toJSON({ includeId: true }),
				{
					id: "foo",
					users: [
						"1",
						"2"
					],
					background: "background",
					banner: "banner",
					created_at: "2000-01-01T00:00:00.000Z",
					display_name: "Foo",
					info: "info",
					logo: "logo",
					name: "foo",
					updated_at: "2000-01-01T00:00:00.000Z"
				},
				"Record has the correct id and attributes"
			);

			assert.ok(
				env.store.hasRecordForId( "twitchTeam", "foo" ),
				"Has the Team record registered in the data store"
			);

			assert.deepEqual(
				env.store.peekAll( "twitchChannel" ).map( channel => get( channel, "id" ) ),
				[
					"1",
					"2"
				],
				"Has all Channel records registered in the data store"
			);
		});

});


test( "Adapter and Serializer (many)", assert => {

	env.store.adapterFor( "twitchTeam" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchTeamFixtures[ "many" ], url, method, query );

	return env.store.query( "twitchTeam", {} )
		.then( records => {
			assert.deepEqual(
				records.map( record => record.toJSON({ includeId: true }) ),
				[
					{
						id: "foo",
						background: "background",
						banner: "banner",
						created_at: "2000-01-01T00:00:00.000Z",
						display_name: "Foo",
						info: "info",
						logo: "logo",
						name: "foo",
						updated_at: "2000-01-01T00:00:00.000Z"
					},
					{
						id: "qux",
						background: "background",
						banner: "banner",
						created_at: "2000-01-01T00:00:00.000Z",
						display_name: "Qux",
						info: "info",
						logo: "logo",
						name: "qux",
						updated_at: "2000-01-01T00:00:00.000Z"
					}
				],
				"Records have the correct id and attributes"
			);

			assert.deepEqual(
				env.store.peekAll( "twitchTeam" ).map( team => get( team, "id" ) ),
				[
					"foo",
					"qux"
				],
				"Has all Team records registered in the data store"
			);

			assert.strictEqual(
				get( env.store.peekAll( "twitchChannel" ), "length" ),
				0,
				"Does not have any Channel records registered in the data store"
			);
		});

});


test( "Adapter and Serializer (by channel)", assert => {

	env.store.adapterFor( "twitchTeam" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchTeamFixtures[ "by-channel" ], url, method, query );

	return env.store.query( "twitchTeam", { channel: "bar" } )
		.then( records => {
			assert.deepEqual(
				records.map( record => record.toJSON({ includeId: true }) ),
				[
					{
						id: "foo",
						background: "background",
						banner: "banner",
						created_at: "2000-01-01T00:00:00.000Z",
						display_name: "Foo",
						info: "info",
						logo: "logo",
						name: "foo",
						updated_at: "2000-01-01T00:00:00.000Z"
					},
					{
						id: "qux",
						background: "background",
						banner: "banner",
						created_at: "2000-01-01T00:00:00.000Z",
						display_name: "Qux",
						info: "info",
						logo: "logo",
						name: "qux",
						updated_at: "2000-01-01T00:00:00.000Z"
					}
				],
				"Records have the correct id and attributes"
			);

			assert.deepEqual(
				env.store.peekAll( "twitchTeam" ).map( team => get( team, "id" ) ),
				[
					"foo",
					"qux"
				],
				"Has all Team records registered in the data store"
			);

			assert.strictEqual(
				get( env.store.peekAll( "twitchChannel" ), "length" ),
				0,
				"Does not have any Channel records registered in the data store"
			);
		});

});


test( "Computed properties", assert => {

	const record = env.store.createRecord( "twitchTeam", { name: "foo" } );


	// title

	assert.strictEqual(
		get( record, "title" ),
		"foo",
		"Shows the name attribute when the display_name attribute is missing"
	);

	run( () => set( record, "display_name", "Foo" ) );
	assert.strictEqual(
		get( record, "title" ),
		"Foo",
		"Shows the display_name attribute when it exists"
	);

});
