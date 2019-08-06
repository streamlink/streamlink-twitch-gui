import { module ,test } from "qunit";
import { setupTest } from "ember-qunit";
import { setupStore } from "store-utils";

import Model from "ember-data/model";

import StoreInitializer from "init/initializers/store";
import { buildResolver } from "test-utils";


module( "init/initializer/store", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({})
	});

	hooks.before(function() {
		StoreInitializer.initialize( this.owner );
	});

	hooks.beforeEach(function() {
		this.store = setupStore( this.owner ).store;
	});


	test( "Model.prototype.destroyRecord fix", async function( assert ) {
		this.owner.register( "model:model", Model.extend() );

		const store = this.store;
		const foo = store.createRecord( "model", { id: "foo" } );

		assert.ok( store.hasRecordForId( "model", "foo" ), "Has foo" );
		assert.ok( !!store.peekRecord( "model", "foo" ), "Returns foo" );
		assert.ok( store._identityMap._map.model.has( "foo" ), "ID map has foo" );
		assert.throws(
			() => store.createRecord( "model", { id: "foo" } ),
			"Can't create duplicate records"
		);

		await foo.destroyRecord();

		assert.notOk( store.hasRecordForId( "model", "foo" ), "Doesn't have foo" );
		assert.notOk( !!store.peekRecord( "model", "foo" ), "Doesn't return foo" );
		// Testing ED internals is kinda stupid, but the patched call of
		// record._internalModel.destroySync()
		// for completely removing the record from the store's cache needs to be tested.
		// This is important, as additional createRecord calls will otherwise fail in the app build
		// and unfortunately I'm unable to reproduce it in a test here.
		assert.notOk( store._identityMap._map.model.has( "foo" ), "ID map doesn't have foo" );
		store.createRecord( "model", { id: "foo" } );
	});
});
