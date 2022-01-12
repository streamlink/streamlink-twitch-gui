import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { adapterRequestFactory, setupStore } from "store-utils";
import { FakeIntlService } from "intl-utils";

import Service from "@ember/service";

import TwitchAdapter from "data/models/twitch/adapter";
import TwitchUser from "data/models/twitch/user/model";
import TwitchUserAdapter from "data/models/twitch/user/adapter";
import TwitchUserSerializer from "data/models/twitch/user/serializer";
import TwitchUserFollowed from "data/models/twitch/user-followed/model";
import TwitchUserFollowedSerializer from "data/models/twitch/user-followed/serializer";
import TwitchUserFollowedFixtures from "fixtures/data/models/twitch/user-followed.yml";


module( "data/models/twitch/user-followed", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			TwitchUser,
			TwitchUserAdapter,
			TwitchUserSerializer,
			TwitchUserFollowed,
			TwitchUserFollowedSerializer,
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

		setupStore( this.owner, { adapter: TwitchAdapter } );
	});


	test( "from", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "twitch-user-followed" ).ajax
			= adapterRequestFactory( assert, TwitchUserFollowedFixtures, "from" );

		const records = await store.query( "twitch-user-followed", { from_id: "1" } );

		assert.propEqual(
			records.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "1-2",
					from: "1",
					to: "2",
					followed_at: "2000-01-01T00:00:00.000Z"
				},
				{
					id: "1-3",
					from: "1",
					to: "3",
					followed_at: "1999-12-31T23:59:59.000Z"
				}
			],
			"Records have the correct IDs and relationship IDs"
		);
		assert.propEqual(
			store.peekAll( "twitch-user-followed" ).mapBy( "id" ),
			[ "1-2", "1-3" ],
			"Has all TwitchUserFollowed records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-user" ).mapBy( "id" ),
			[],
			"Has no TwitchUser records registered in the data store"
		);
	});

	test( "to", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "twitch-user-followed" ).ajax
			= adapterRequestFactory( assert, TwitchUserFollowedFixtures, "to" );

		const records = await store.query( "twitch-user-followed", { to_id: "1" } );

		assert.propEqual(
			records.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "2-1",
					from: "2",
					to: "1",
					followed_at: "2000-01-01T00:00:00.000Z"
				},
				{
					id: "3-1",
					from: "3",
					to: "1",
					followed_at: "1999-12-31T23:59:59.000Z"
				}
			],
			"Records have the correct IDs and relationship IDs"
		);
		assert.propEqual(
			store.peekAll( "twitch-user-followed" ).mapBy( "id" ),
			[ "2-1", "3-1" ],
			"Has all TwitchUserFollowed records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-user" ).mapBy( "id" ),
			[],
			"Has no TwitchUser records registered in the data store"
		);
	});

	test( "bidirectional", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "twitch-user-followed" ).ajax
			= adapterRequestFactory( assert, TwitchUserFollowedFixtures, "bidirectional" );

		const records = await store.query( "twitch-user-followed", { from_id: "1", to_id: "2" } );

		assert.propEqual(
			records.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "1-2",
					from: "1",
					to: "2",
					followed_at: "2000-01-01T00:00:00.000Z"
				}
			],
			"Records have the correct IDs and relationship IDs"
		);
		assert.propEqual(
			store.peekAll( "twitch-user-followed" ).mapBy( "id" ),
			[ "1-2" ],
			"Has all TwitchUserFollowed records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-user" ).mapBy( "id" ),
			[],
			"Has no TwitchUser records registered in the data store"
		);
	});

	test( "mismatch", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "twitch-user-followed" ).ajax
			= adapterRequestFactory( assert, TwitchUserFollowedFixtures, "mismatch" );

		const records = await store.query( "twitch-user-followed", { from_id: "1", to_id: "4" } );

		assert.strictEqual(
			records.length,
			0,
			"Records are empty"
		);
		assert.strictEqual(
			store.peekAll( "twitch-user-followed" ).length,
			0,
			"Has no TwitchUserFollowed records registered in the data store"
		);
		assert.strictEqual(
			store.peekAll( "twitch-user" ).length,
			0,
			"Has no TwitchUser records registered in the data store"
		);
	});
});
