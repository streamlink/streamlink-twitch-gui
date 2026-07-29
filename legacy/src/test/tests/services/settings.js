import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { setupStore } from "store-utils";
import sinon from "sinon";

import { get, set } from "@ember/object";
import { on } from "@ember/object/evented";
import Adapter from "ember-data/adapter";
import attr from "ember-data/attr";
import Model from "ember-data/model";

import SettingsService from "services/settings";


module( "services/settings", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			Settings: Model.extend({
				foo: attr( "string", { defaultValue: "bar" } )
			})
		})
	});

	/** @typedef {TestContext} TestContextSettingsService */
	/** @this TestContextSettingsService */
	hooks.beforeEach(function() {
		setupStore( this.owner );

		this.findAllStub = sinon.stub().resolves([]);
		this.createRecordStub = sinon.stub().resolves();
		this.updateRecordStub = sinon.stub().resolves();

		this.onInitializedSpy = sinon.spy();
		this.onDidUpdateSpy = sinon.spy();

		this.owner.register( "adapter:settings", Adapter.extend({
			findAll: this.findAllStub,
			createRecord: this.createRecordStub,
			updateRecord: this.updateRecordStub
		}) );

		this.owner.register( "service:settings", SettingsService.extend({
			_onInitialized: on( "initialized", this.onInitializedSpy ),
			_onDidUpdate: on( "didUpdate", this.onDidUpdateSpy )
		}) );
	});


	/** @this TestContextSettingsService */
	test( "Is Service", function( assert ) {
		assert.ok( SettingsService.isServiceFactory, "Is a service factory object" );
	});

	/** @this TestContextSettingsService */
	test( "Non existing record", async function( assert ) {
		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		/** @type {SettingsService} */
		const settingsService = this.owner.lookup( "service:settings" );

		assert.notOk( this.onInitializedSpy.called, "Not yet initialized" );
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

		assert.ok( this.onInitializedSpy.calledOnce, "Is initialized now" );
		assert.ok( this.createRecordStub.calledOnce, "Creates record if none exists" );
		assert.notOk( this.updateRecordStub.called, "Doesn't call updateRecord" );
		assert.notOk( this.onDidUpdateSpy.called, "Didn't update settings yet" );
		assert.ok( store.hasRecordForId( "settings", 1 ), "Settings record with ID 1 exists" );
		assert.strictEqual(
			get( settingsService, "foo" ),
			"bar",
			"Properties are proxied once initialized"
		);

		await new Promise( resolve => {
			settingsService.on( "didUpdate", resolve );
			set( settingsService, "foo", "baz" );
			get( settingsService, "content" ).save();
		});
		assert.ok( this.updateRecordStub.calledOnce, "Has updated the record" );
		assert.ok( this.onDidUpdateSpy.calledOnce, "Triggers the didUpdate event" );
	});

	/** @this TestContextSettingsService */
	test( "Existing record", async function( assert ) {
		this.findAllStub.resolves([ { id: 1 } ]);

		/** @type {DS.Store} */
		const store = this.owner.lookup( "service:store" );
		/** @type {SettingsService} */
		const settingsService = this.owner.lookup( "service:settings" );

		assert.notOk( this.onInitializedSpy.called, "Not yet initialized" );
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

		assert.ok( this.onInitializedSpy.calledOnce, "Is initialized now" );
		assert.notOk( this.createRecordStub.called, "Doesn't create new record if one exists" );
		assert.notOk( this.updateRecordStub.called, "Doesn't call updateRecord" );
		assert.notOk( this.onDidUpdateSpy.called, "Didn't update settings yet" );
		assert.ok( store.hasRecordForId( "settings", 1 ), "Settings record with ID 1 exists" );
		assert.strictEqual(
			get( settingsService, "foo" ),
			"bar",
			"Properties are proxied once initialized"
		);
	});
});
