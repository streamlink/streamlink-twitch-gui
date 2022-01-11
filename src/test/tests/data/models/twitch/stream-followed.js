import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { adapterRequestFactory, assertRelationships, setupStore } from "store-utils";
import { FakeIntlService } from "intl-utils";

import Service from "@ember/service";
import Model from "ember-data/model";

import TwitchAdapter from "data/models/twitch/adapter";
import TwitchStreamFollowed from "data/models/twitch/stream-followed/model";
import TwitchStreamFollowedSerializer from "data/models/twitch/stream-followed/serializer";
import TwitchStreamFollowedFixtures from "fixtures/data/models/twitch/stream-followed.yml";
import TwitchStream from "data/models/twitch/stream/model";
import TwitchStreamSerializer from "data/models/twitch/stream/serializer";


module( "data/models/twitch/stream-followed", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			IntlService: FakeIntlService,
			SettingsService: Service.extend(),
			TwitchStreamFollowed,
			TwitchStreamFollowedSerializer,
			TwitchStream,
			TwitchStreamSerializer,
			TwitchUser: Model.extend(),
			TwitchChannel: Model.extend(),
			TwitchGame: Model.extend()
		})
	});

	hooks.beforeEach(function() {
		setupStore( this.owner, { adapter: TwitchAdapter } );
	});


	test( "Model relationships", function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		/** @type {TwitchStreamFollowed} */
		const model = store.modelFor( "twitch-stream-followed" );

		assertRelationships( assert, model, [
			{
				key: "stream",
				kind: "belongsTo",
				type: "twitch-stream",
				options: { async: false }
			}
		]);
	});

	test( "query", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "twitch-stream-followed" ).ajax
			= adapterRequestFactory( assert, TwitchStreamFollowedFixtures );

		const records = await store.query( "twitch-stream-followed", { user_id: "1" } );

		assert.propEqual(
			records.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "1",
					stream: "1"
				},
				{
					id: "2",
					stream: "2"
				}
			],
			"Records have the correct IDs and relationship IDs"
		);
		assert.propEqual(
			store.peekAll( "twitch-stream-followed" ).mapBy( "id" ),
			[ "1", "2" ],
			"Has all TwitchStreamFollowed records registered in the data store"
		);
		assert.propEqual(
			store.peekAll( "twitch-stream" ).mapBy( "id" ),
			[ "1", "2" ],
			"Has all TwitchStream records registered in the data store"
		);
	});
});
