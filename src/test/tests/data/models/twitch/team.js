import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { adapterRequestFactory, assertRelationships, setupStore } from "store-utils";
import { FakeIntlService } from "intl-utils";

import { set } from "@ember/object";
import Service from "@ember/service";

import TwitchTeam from "data/models/twitch/team/model";
import TwitchTeamAdapter from "data/models/twitch/team/adapter";
import TwitchTeamSerializer from "data/models/twitch/team/serializer";
import TwitchTeamFixtures from "fixtures/data/models/twitch/team.yml";


module( "data/models/twitch/team", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			IntlService: FakeIntlService,
			SettingsService: Service.extend({}),
			TwitchTeam,
			TwitchTeamAdapter,
			TwitchTeamSerializer
		})
	});

	hooks.beforeEach(function() {
		setupStore( this.owner );
	});


	test( "Model relationships", function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		/** @type {TwitchTeam} */
		const model = store.modelFor( "twitch-team" );

		assertRelationships( assert, model, [] );
	});

	test( "Computed properties", function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		const record = store.createRecord( "twitch-team", { id: "1", team_name: "foo" } );

		assert.strictEqual(
			record.title,
			"foo",
			"Shows the team_name attribute when the team_display_name attribute is missing"
		);

		set( record, "team_display_name", "Foo" );
		assert.strictEqual(
			record.title,
			"Foo",
			"Shows the team_display_name attribute when it exists"
		);
	});

	test( "findRecord", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		const responseStub
			= store.adapterFor( "twitch-team" ).ajax
			= adapterRequestFactory( assert, TwitchTeamFixtures, "findRecord" );

		const record = await store.findRecord( "twitch-team", "1" );

		assert.propEqual(
			record.toJSON({ includeId: true }),
			{
				id: "1",
				users: [
					"1",
					"2"
				],
				background_image_url: "https://mock/twitch-team/1/background_image-1920x1080.png",
				banner: "https://mock/twitch-team/1/banner.png",
				created_at: "2000-01-01T00:00:00.000Z",
				updated_at: "2000-01-01T00:00:01.000Z",
				info: "team description",
				thumbnail_url: "https://mock/twitch-team/1/thumbnail-600x600.png",
				team_name: "team name",
				team_display_name: "cool team"
			},
			"Record has the correct id and attributes"
		);
		assert.propEqual(
			store.peekAll( "twitch-team" ).mapBy( "id" ),
			[ "1" ],
			"Has the TwitchTeam record registered in the data store"
		);
		assert.strictEqual(
			responseStub.callCount,
			1,
			"Queries the API for teams only once"
		);
	});

	test( "query", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		const responseStub
			= store.adapterFor( "twitch-team" ).ajax
			= adapterRequestFactory( assert, TwitchTeamFixtures, "query" );

		const records = await store.query( "twitch-team", { broadcaster_id: "1" } );

		assert.propEqual(
			records.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "1",
					users: [],
					background_image_url: null,
					banner: null,
					created_at: null,
					updated_at: null,
					info: null,
					thumbnail_url: null,
					team_name: null,
					team_display_name: null
				},
				{
					id: "2",
					users: [],
					background_image_url: null,
					banner: null,
					created_at: null,
					updated_at: null,
					info: null,
					thumbnail_url: null,
					team_name: null,
					team_display_name: null
				}
			],
			"Records have the correct IDs and attributes"
		);
		assert.propEqual(
			store.peekAll( "twitch-team" ).mapBy( "id" ),
			[ "1", "2" ],
			"Has the TwitchTeam records registered in the data store"
		);
		assert.strictEqual(
			responseStub.callCount,
			1,
			"Queries API once"
		);
	});
});
