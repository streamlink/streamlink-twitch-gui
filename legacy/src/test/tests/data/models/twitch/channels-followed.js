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
import TwitchChannelsFollowed from "data/models/twitch/channels-followed/model";
import TwitchChannelsFollowedAdapter from "data/models/twitch/channels-followed/adapter";
import TwitchChannelsFollowedSerializer from "data/models/twitch/channels-followed/serializer";
import TwitchChannelsFollowedFixtures from "fixtures/data/models/twitch/channels-followed.yml";


module( "data/models/twitch/channels-followed", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			TwitchUser,
			TwitchUserAdapter,
			TwitchUserSerializer,
			TwitchChannelsFollowed,
			TwitchChannelsFollowedAdapter,
			TwitchChannelsFollowedSerializer,
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


	test( "directional", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "twitch-channels-followed" ).ajax
			= adapterRequestFactory( assert, TwitchChannelsFollowedFixtures, "directional" );

		const records = await store.query( "twitch-channels-followed", { user_id: "1" } );

		assert.propEqual(
			records.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "1-2",
					user_id: "1",
					broadcaster_id: "2",
					followed_at: "2000-01-01T00:00:00.000Z"
				},
				{
					id: "1-3",
					user_id: "1",
					broadcaster_id: "3",
					followed_at: "1999-12-31T23:59:59.000Z"
				}
			],
			"Records have the correct IDs and relationship IDs"
		);
		assert.propEqual(
			store.peekAll( "twitch-channels-followed" ).mapBy( "id" ),
			[ "1-2", "1-3" ],
			"Has all TwitchChannelsFollowed records registered in the data store"
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

		store.adapterFor( "twitch-channels-followed" ).ajax
			= adapterRequestFactory( assert, TwitchChannelsFollowedFixtures, "bidirectional" );

		const records = await store.query( "twitch-channels-followed", {
			user_id: "1",
			broadcaster_id: "2"
		} );

		assert.propEqual(
			records.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "1-2",
					user_id: "1",
					broadcaster_id: "2",
					followed_at: "2000-01-01T00:00:00.000Z"
				}
			],
			"Records have the correct IDs and relationship IDs"
		);
		assert.propEqual(
			store.peekAll( "twitch-channels-followed" ).mapBy( "id" ),
			[ "1-2" ],
			"Has all TwitchChannelsFollowed records registered in the data store"
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

		store.adapterFor( "twitch-channels-followed" ).ajax
			= adapterRequestFactory( assert, TwitchChannelsFollowedFixtures, "mismatch" );

		const records = await store.query( "twitch-channels-followed", {
			user_id: "1",
			broadcaster_id: "4"
		} );

		assert.strictEqual(
			records.length,
			0,
			"Records are empty"
		);
		assert.strictEqual(
			store.peekAll( "twitch-channels-followed" ).length,
			0,
			"Has no TwitchChannelsFollowed records registered in the data store"
		);
		assert.strictEqual(
			store.peekAll( "twitch-user" ).length,
			0,
			"Has no TwitchUser records registered in the data store"
		);
	});
});
