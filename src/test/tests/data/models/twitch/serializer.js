import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { adapterRequestFactory, setupStore } from "store-utils";

import Ember from "ember";
import attr from "ember-data/attr";
import Model from "ember-data/model";

import TwitchAdapter from "data/models/twitch/adapter";
import TwitchSerializer from "data/models/twitch/serializer";

import fixturesResponse from "fixtures/data/models/twitch/serializer/response.yml";
import fixturesSingleResponse from "fixtures/data/models/twitch/serializer/single-response.yml";
import fixturesMetadata from "fixtures/data/models/twitch/serializer/metadata.yml";


module( "data/models/twitch/serializer", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver()
	});

	hooks.beforeEach(function() {
		setupStore( this.owner );

		this.owner.register( "adapter:foo", TwitchAdapter.extend({
			ajax: null
		}) );
		this.owner.register( "serializer:foo", TwitchSerializer.extend({
			modelNameFromPayloadKey() {
				return "foo";
			}
		}) );
		this.owner.register( "model:foo", Model.extend({
			foo: attr( "string" )
		}).reopenClass({
			toString() {
				return "foo";
			}
		}) );

		// work around Ember throwing an exception that can't be caught by the tests
		this._emberonerror = Ember.onerror;
		Ember.onerror = new Function();
	});

	hooks.afterEach(function() {
		Ember.onerror = this._emberonerror;
	});


	test( "Response normalization - invalid", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "foo" ).ajax
			= adapterRequestFactory( assert, fixturesResponse, "invalid" );

		await assert.rejects(
			store.query( "foo", {} ),
			new Error( "Unknown payload format of the API response" ),
			"Rejects with an error on invalid payload"
		);
	});

	test( "Response normalization - valid", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "foo" ).ajax
			= adapterRequestFactory( assert, fixturesResponse, "valid" );

		const records = await store.query( "foo", {} );

		assert.propEqual(
			records.map( record => record.toJSON({ includeId: true }) ),
			[
				{
					id: "1",
					foo: "bar"
				},
				{
					id: "2",
					foo: "baz"
				}
			],
			"Responses get normalized according to the serializer's modelNameFromPayloadKey"
		);
		assert.propEqual(
			store.peekAll( "foo" ).mapBy( "id" ),
			[ "1", "2" ],
			"Has all records in the data store"
		);
	});

	test( "Single response normalization - invalid", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "foo" ).ajax
			= adapterRequestFactory( assert, fixturesSingleResponse, "invalid" );

		await assert.rejects(
			store.queryRecord( "foo", {} ),
			new Error( "Missing data while normalizing single response" ),
			"Rejects with an error on invalid payload"
		);
	});

	test( "Single response normalization - valid", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "foo" ).ajax
			= adapterRequestFactory( assert, fixturesSingleResponse, "valid" );

		const record = await store.queryRecord( "foo", {} );

		assert.propEqual(
			record.toJSON({ includeId: true }),
			{
				id: "1",
				foo: "bar"
			},
			"Responses of single record queries get normalized"
		);
		assert.propEqual(
			store.peekAll( "foo" ).mapBy( "id" ),
			[ "1" ],
			"Has all records in the data store"
		);
	});

	test( "Metadata - invalid", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "foo" ).ajax
			= adapterRequestFactory( assert, fixturesMetadata, "invalid" );

		const records = await store.query( "foo", {} );

		assert.propEqual(
			records.meta,
			{},
			"Parses metadata correctly"
		);
	});

	test( "Metadata - valid", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );

		store.adapterFor( "foo" ).ajax
			= adapterRequestFactory( assert, fixturesMetadata, "valid" );

		const records = await store.query( "foo", {} );

		assert.propEqual(
			records.meta,
			{
				pagination: {
					cursor: "cursor-value"
				},
				str: "foo",
				num: 123
			},
			"Parses metadata correctly"
		);
	});
});
