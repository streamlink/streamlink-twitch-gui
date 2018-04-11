import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import { I18nService } from "i18n-utils";
import { get } from "@ember/object";
import Service from "@ember/service";
import Model from "ember-data/model";
import RESTSerializer from "ember-data/serializers/rest";

import Product from "data/models/twitch/product/model";
import ProductSerializer from "data/models/twitch/product/serializer";
import ProductEmoticon from "data/models/twitch/product-emoticon/model";
import ProductEmoticonSerializer from "data/models/twitch/product-emoticon/serializer";
import User from "data/models/twitch/user/model";
import UserAdapter from "data/models/twitch/user/adapter";
import UserSerializer from "data/models/twitch/user/serializer";
import Channel from "data/models/twitch/channel/model";
import ChannelSerializer from "data/models/twitch/channel/serializer";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchProductFixtures from "fixtures/data/models/twitch/product.json";
import TwitchUserFixtures from "fixtures/data/models/twitch/user.json";
import TwitchChannelFixtures from "fixtures/data/models/twitch/channel.json";


let owner, env;


module( "data/models/twitch/product", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend() );
		owner.register( "service:i18n", I18nService );
		owner.register( "service:settings", Service.extend() );
		owner.register( "model:twitch-product", Product );
		owner.register( "serializer:twitch-product", ProductSerializer.extend({
			modelNameFromPayloadKey() {
				return "twitchProduct";
			}
		}) );
		owner.register( "model:twitch-product-emoticon", ProductEmoticon );
		owner.register( "serializer:twitch-product-emoticon", ProductEmoticonSerializer );
		owner.register( "model:twitch-user", User );
		owner.register( "adapter:twitch-user", UserAdapter );
		owner.register( "serializer:twitch-user", UserSerializer );
		owner.register( "model:twitch-channel", Channel );
		owner.register( "adapter:twitch-channel", TwitchAdapter.extend() );
		owner.register( "serializer:twitch-channel", ChannelSerializer );
		owner.register( "model:twitch-stream", Model.extend() );
		owner.register( "serializer:twitch-stream", RESTSerializer.extend() );

		env = setupStore( owner );
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "Serializer and partner_login relation", assert => {

	// TwitchProduct is just an embedded model
	// ignore the queried record id

	env.adapter.queryRecord = () =>
		Promise.resolve({
			twitchProduct: TwitchProductFixtures[ "embedded" ]
		});

	env.store.adapterFor( "twitch-user" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchUserFixtures[ "by-id" ], url, method, query );

	env.store.adapterFor( "twitch-channel" ).ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchChannelFixtures[ "by-id" ], url, method, query );

	return env.store.queryRecord( "twitchProduct", 1 )
		.then( record => {
			assert.deepEqual(
				record.toJSON({ includeId: true }),
				{
					id: "product foo",
					short_name: "foo",
					ticket_type: "chansub",
					owner_name: "foo",
					features: {
						bitrate_access: []
					},
					interval_number: 1,
					recurring: true,
					partner_login: "foo",
					price: "$4.99",
					period: "Month",
					emoticons: [
						"bar",
						"baz"
					]
				},
				"Has the correct model attributes"
			);

			assert.ok(
				env.store.hasRecordForId( "twitchProduct", "product foo" ),
				"Has the new Product record registered in the data store"
			);

			assert.ok(
				   env.store.hasRecordForId( "twitchProductEmoticon", "bar" )
				&& env.store.hasRecordForId( "twitchProductEmoticon", "baz" ),
				"Has all ProductEmoticon records registered in the data store"
			);

			assert.strictEqual(
				env.store.peekAll( "twitchUser" ).get( "length" ),
				0,
				"Does not have any User records registered in the data store"
			);

			assert.strictEqual(
				env.store.peekAll( "twitchChannel" ).get( "length" ),
				0,
				"Does not have any Channel records registered in the data store"
			);

			return get( record, "partner_login" )
				.then( () => {
					assert.ok(
						env.store.hasRecordForId( "twitchUser", "foo" ),
						"Store has a User record registered after accessing the partner_login"
					);

					return get( record, "channel" );
				})
				.then( () => {
					assert.ok(
						env.store.hasRecordForId( "twitchChannel", 1 ),
						"Store has a User record registered after accessing the partner_login"
					);
				});
		});

});
