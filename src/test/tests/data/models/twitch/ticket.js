import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import { FakeI18nService } from "i18n-utils";
import sinon from "sinon";

import { set } from "@ember/object";
import Service from "@ember/service";
import Model from "ember-data/model";
import RESTSerializer from "ember-data/serializers/rest";
import Moment from "moment";

import ModelFragmentsInitializer from "init/initializers/model-fragments";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchTicket from "data/models/twitch/ticket/model";
import TwitchTicketSerializer from "data/models/twitch/ticket/serializer";
import TwitchTicketProduct from "data/models/twitch/ticket/product/fragment";
import TwitchTicketProductEmoticon from "data/models/twitch/ticket/product/emoticon/fragment";
import TwitchTicketProductFeatures from "data/models/twitch/ticket/product/features/fragment";
import TwitchTicketPurchaseProfile from "data/models/twitch/ticket/purchase-profile/fragment";
import TwitchUser from "data/models/twitch/user/model";
import TwitchUserAdapter from "data/models/twitch/user/adapter";
import TwitchUserSerializer from "data/models/twitch/user/serializer";
import TwitchChannel from "data/models/twitch/channel/model";
import TwitchChannelSerializer from "data/models/twitch/channel/serializer";

import TwitchTicketFixtures from "fixtures/data/models/twitch/ticket.json";
import TwitchUserFixtures from "fixtures/data/models/twitch/user.json";
import TwitchChannelFixtures from "fixtures/data/models/twitch/channel.json";


module( "data/models/twitch/ticket", function( hooks ) {
	hooks.before(function() {
		Moment.locale( "en" );
	});

	hooks.beforeEach(function( assert ) {
		this.fakeTimer = sinon.useFakeTimers({
			toFake: [ "Date", "setTimeout", "clearTimeout" ],
			now: Date.parse( "2000-01-01T00:00:00Z" ),
			target: window
		});

		this.owner = buildOwner();

		ModelFragmentsInitializer.initialize( this.owner );

		this.owner.register( "service:auth", Service.extend({
			session: {
				user_name: "foobar"
			}
		}) );
		this.owner.register( "service:i18n", FakeI18nService );
		this.owner.register( "service:settings", Service.extend() );
		this.owner.register( "model:twitch-ticket", TwitchTicket );
		this.owner.register( "adapter:twitch-ticket", TwitchAdapter.extend() );
		this.owner.register( "serializer:twitch-ticket", TwitchTicketSerializer );
		this.owner.register( "model:twitch-ticket-product", TwitchTicketProduct );
		this.owner.register( "model:twitch-ticket-product-emoticon", TwitchTicketProductEmoticon );
		this.owner.register( "model:twitch-ticket-product-features", TwitchTicketProductFeatures );
		this.owner.register( "model:twitch-ticket-purchase-profile", TwitchTicketPurchaseProfile );
		this.owner.register( "model:twitch-user", TwitchUser );
		this.owner.register( "adapter:twitch-user", TwitchUserAdapter );
		this.owner.register( "serializer:twitch-user", TwitchUserSerializer );
		this.owner.register( "model:twitch-channel", TwitchChannel );
		this.owner.register( "adapter:twitch-channel", TwitchAdapter.extend() );
		this.owner.register( "serializer:twitch-channel", TwitchChannelSerializer );
		this.owner.register( "model:twitch-stream", Model.extend() );
		this.owner.register( "serializer:twitch-stream", RESTSerializer.extend() );

		this.env = setupStore( this.owner, { adapter: TwitchAdapter } );

		this.env.store.adapterFor( "twitch-ticket" ).ajax = ( ...args ) =>
			adapterRequest( assert, TwitchTicketFixtures, ...args );
		this.env.store.adapterFor( "twitch-user" ).ajax = ( ...args ) =>
			adapterRequest( assert, TwitchUserFixtures[ "by-id" ], ...args );
		this.env.store.adapterFor( "twitch-channel" ).ajax = ( ...args ) =>
			adapterRequest( assert, TwitchChannelFixtures[ "by-id" ], ...args );
	});

	hooks.afterEach(function() {
		this.fakeTimer.restore();

		runDestroy( this.owner );
		this.owner = this.env = null;
	});


	test( "Adapter and Serializer", async function( assert ) {
		const records = await this.env.store.query( "twitch-ticket", {} );

		assert.propEqual(
			records.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "1",
					access_start: null,
					access_end: "2000-02-01T00:00:00.000Z",
					expired: false,
					is_gift: false,
					partner_login: "foo",
					purchase_profile: null,
					product: {
						name: "Subscription to Foo",
						short_name: "foo",
						ticket_type: "chansub",
						owner_name: "foo",
						features: {
							tier: "1000",
							emoticon_set_ids: [ 1234 ],
							base_emoticon_set_id: 1234
						},
						interval_number: 1,
						recurring: true,
						price: "$4.99",
						period: "Month",
						emoticons: [
							{
								regex: "foo",
								regex_display: null,
								state: "active",
								url: "emoticon-1.png"
							},
							{
								regex: "be?ar",
								regex_display: "bar",
								state: "active",
								url: "emoticon-2.png"
							},
							{
								regex: "baz",
								regex_display: null,
								state: "inactive",
								url: "emoticon-3.png"
							}
						]
					}
				},
				{
					id: "2",
					access_start: "1999-01-01T00:00:00.000Z",
					access_end: "2000-02-01T00:00:00.000Z",
					expired: false,
					is_gift: false,
					partner_login: "bar",
					purchase_profile: null,
					product: {
						name: "Subscription to Bar",
						short_name: "bar",
						ticket_type: "chansub",
						owner_name: "bar",
						features: null,
						interval_number: 1,
						recurring: true,
						price: "$4.99",
						period: "Month",
						emoticons: []
					}
				},
				{
					id: "3",
					access_start: "1999-01-01T00:00:00.000Z",
					access_end: "2000-02-01T00:00:00.000Z",
					expired: false,
					is_gift: false,
					partner_login: "baz",
					purchase_profile: {
						refundable: false,
						paid_on: "2000-01-01T00:00:00.000Z",
						expired: false,
						consecutive_months: 6,
						renewal_date: "2000-02-01T00:00:00.000Z",
						will_renew: true
					},
					product: {
						name: "Subscription to Baz",
						short_name: "baz",
						ticket_type: "chansub",
						owner_name: "baz",
						features: null,
						interval_number: 1,
						recurring: true,
						price: "$4.99",
						period: "Month",
						emoticons: []
					}
				}
			],
			"Has the correct model attributes"
		);

		assert.propEqual(
			[
				this.env.store.hasRecordForId( "twitch-ticket", 1 ),
				this.env.store.hasRecordForId( "twitch-ticket", 2 ),
				this.env.store.hasRecordForId( "twitch-ticket", 3 )
			],
			[ true, true, true ],
			"Has all Ticket records registered in the data store"
		);

		assert.strictEqual(
			this.env.store.peekAll( "twitch-user" ).length,
			0,
			"Does not have any TwitchUser records registered in the data store"
		);

		assert.strictEqual(
			this.env.store.peekAll( "twitch-channel" ).length,
			0,
			"Does not have any TwitchChannel records registered in the data store"
		);
	});


	test( "Channel reference", async function( assert ) {
		const records = await this.env.store.query( "twitch-ticket", {} );
		const [ ticketOne ] = records.toArray();

		await ticketOne.loadChannel();

		assert.ok(
			this.env.store.hasRecordForId( "twitch-user", "foo" ),
			"Has the foo TwitchUser record registered in the data store"
		);
		assert.ok(
			this.env.store.hasRecordForId( "twitch-channel", "1" ),
			"Has the foo TwitchChannel record registered in the data store"
		);

		assert.strictEqual(
			ticketOne.channel.content.name,
			"foo",
			"Has a channel alias"
		);
	});


	test( "hasEnded / ends", async function( assert ) {
		const records = await this.env.store.query( "twitch-ticket", {} );
		const [ ticketOne ] = records.toArray();

		assert.notOk( ticketOne.hasEnded, "Has not ended yet" );
		assert.strictEqual( ticketOne.ends, "in a month", "Ends in a month" );

		this.fakeTimer.setSystemTime( Date.parse( "2000-02-01T00:00:01Z" ) );
		assert.ok( ticketOne.hasEnded, "Has ended" );
	});


	test( "subbedFor", async function( assert ) {
		const records = await this.env.store.query( "twitch-ticket", {} );
		const [ ticketOne, ticketTwo, ticketThree ] = records.toArray();

		assert.strictEqual( ticketOne.subbedFor, 1, "Returns one if months is unkown" );
		assert.strictEqual( ticketTwo.subbedFor, 12, "Calculates months from access_start" );
		assert.strictEqual( ticketThree.subbedFor, 6, "Returns consecutive_months if it is set" );

		set( ticketThree, "purchase_profile.consecutive_months", null );
		assert.strictEqual(
			ticketThree.subbedFor,
			12,
			"Falls back to access_start if consecutive_months is unset"
		);
	});


	test( "Emoticons", async function( assert ) {
		const records = await this.env.store.query( "twitch-ticket", {} );
		const [ ticketOne ] = records.toArray();

		assert.propEqual(
			ticketOne.product.emoticons.map( e => e.isActive ),
			[ true, true, false ],
			"Emoticons have a computed isActive property"
		);

		assert.propEqual(
			ticketOne.product.emoticons.map( e => e.title ),
			[ "foo", "bar", "baz" ],
			"Emoticons have a computed title property"
		);
	});

});
