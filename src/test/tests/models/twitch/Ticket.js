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
import Model from "ember-data/model";
import RESTSerializer from "ember-data/serializers/rest";
import Ticket from "models/twitch/Ticket";
import TicketSerializer from "models/twitch/TicketSerializer";
import Product from "models/twitch/Product";
import ProductSerializer from "models/twitch/ProductSerializer";
import ProductEmoticon from "models/twitch/ProductEmoticon";
import ProductEmoticonSerializer from "models/twitch/ProductEmoticonSerializer";
import User from "models/twitch/User";
import UserAdapter from "models/twitch/UserAdapter";
import UserSerializer from "models/twitch/UserSerializer";
import TwitchAdapter from "store/TwitchAdapter";
import TwitchTicketFixtures from "fixtures/models/twitch/Ticket.json";


let owner, env;


module( "models/twitch/Ticket", {
	beforeEach() {
		owner = buildOwner();

		owner.register( "service:auth", Service.extend({
			session: {
				user_name: "foobar"
			}
		}) );
		owner.register( "model:twitch-ticket", Ticket );
		owner.register( "serializer:twitch-ticket", TicketSerializer );
		owner.register( "model:twitch-product", Product );
		owner.register( "serializer:twitch-product", ProductSerializer );
		owner.register( "model:twitch-product-emoticon", ProductEmoticon );
		owner.register( "serializer:twitch-product-emoticon", ProductEmoticonSerializer );
		owner.register( "model:twitch-user", User );
		owner.register( "adapter:twitch-user", UserAdapter );
		owner.register( "serializer:twitch-user", UserSerializer );
		owner.register( "model:twitch-channel", Model.extend() );
		owner.register( "serializer:twitch-channel", RESTSerializer.extend() );
		owner.register( "model:twitch-stream", Model.extend() );
		owner.register( "serializer:twitch-stream", RESTSerializer.extend() );

		env = setupStore( owner, { adapter: TwitchAdapter } );
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "Adapter and Serializer", assert => {

	env.adapter.ajax = ( url, method, query ) =>
		adapterRequest( assert, TwitchTicketFixtures, url, method, query );

	return env.store.query( "twitchTicket", {} )
		.then( records => {
			assert.deepEqual(
				records.map( record => record.toJSON({ includeId: true }) ),
				[
					{
						id: "1",
						product: "1",
						access_start: "2000-01-01T00:00:00.000Z",
						access_end: "2000-01-01T00:00:00.000Z",
						purchase_profile: {
							refundable: false,
							will_renew: true,
							paid_on: "2000-01-01T00:00:00Z",
							expired: false,
							payment_provider: "some payment provider",
							consecutive_months: 12
						}
					}
				],
				"Has the correct model attributes"
			);

			assert.ok(
				env.store.hasRecordForId( "twitchTicket", 1 ),
				"Has all Ticket records registered in the data store"
			);

			assert.ok(
				env.store.hasRecordForId( "twitchProduct", 1 ),
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
		});

});
