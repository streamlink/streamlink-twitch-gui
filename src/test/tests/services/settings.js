import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { setupStore } from "store-utils";
import { setOwner } from "@ember/application";
import { get, set } from "@ember/object";
import Adapter from "ember-data/adapter";
import attr from "ember-data/attr";
import Model from "ember-data/model";

import SettingsService from "services/settings";


let owner, env;


module( "services/settings", {
	beforeEach() {
		owner = buildOwner();
		owner.register( "model:settings", Model.extend({
			foo: attr( "string", { defaultValue: "bar" } )
		}) );

		env = setupStore( owner );
	},

	afterEach() {
		runDestroy( owner );
		owner = env = null;
	}
});


test( "Non existing record", async assert => {

	assert.expect( 9 );

	owner.register( "adapter:settings", Adapter.extend({
		async findAll() {
			assert.ok( true, "Calls findAll()" );
			return [];
		},
		async createRecord() {
			assert.ok( true, "Calls createRecord()" );
		},
		async updateRecord() {
			assert.ok( true, "Calls updateRecord()" );
		}
	}) );

	assert.ok( SettingsService.isServiceFactory, "Is a service factory object" );

	const settingsService = SettingsService.extend({
		init() {
			setOwner( this, owner );
			this._super( ...arguments );
		}
	}).create();

	assert.strictEqual(
		get( settingsService, "content" ),
		null,
		"Doesn't have content initially"
	);
	assert.strictEqual(
		get( settingsService, "foo" ),
		undefined,
		"Foo property does not exist yet"
	);

	await new Promise( resolve => {
		settingsService.on( "initialized", resolve );
	});

	assert.ok( env.store.hasRecordForId( "settings", 1 ), "Settings record with ID 1 exists" );

	assert.strictEqual(
		get( settingsService, "foo" ),
		"bar",
		"Properties are proxied once initialized"
	);

	await new Promise( resolve => {
		settingsService.on( "didUpdate", () => {
			assert.ok( true, "Supports the didUpdate event" );
			resolve();
		});
		set( settingsService, "foo", "baz" );
		get( settingsService, "content" ).save();
	});

});


test( "Existing record", async assert => {

	assert.expect( 5 );

	owner.register( "adapter:settings", Adapter.extend({
		async findAll() {
			assert.ok( true, "Calls findAll()" );
			return [{
				id: 1
			}];
		}
	}) );

	const settingsService = SettingsService.extend({
		init() {
			setOwner( this, owner );
			this._super( ...arguments );
		}
	}).create();

	assert.strictEqual(
		get( settingsService, "content" ),
		null,
		"Doesn't have content initially"
	);
	assert.strictEqual(
		get( settingsService, "foo" ),
		undefined,
		"Foo property does not exist yet"
	);

	await new Promise( resolve => {
		settingsService.on( "initialized", resolve );
	});

	assert.ok( env.store.hasRecordForId( "settings", 1 ), "Settings record with ID 1 exists" );

	assert.strictEqual(
		get( settingsService, "foo" ),
		"bar",
		"Properties are proxied once initialized"
	);

});
