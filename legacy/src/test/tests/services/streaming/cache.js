import { module, test } from "qunit";
import { EventEmitter } from "events";

import cacheItemInjector from "inject-loader?fs!services/streaming/cache/item";
import cacheInjector from "inject-loader?./item!services/streaming/cache/cache";
import registryInjector from "inject-loader?./item!services/streaming/cache/index";


module( "services/streaming/cache" );


test( "CacheItem", assert => {

	assert.expect( 8 );

	class Watcher extends EventEmitter {
		constructor( path, listener ) {
			super();
			assert.strictEqual( path, "foo", "Sets the correct path on the file watcher" );
			assert.ok( listener instanceof Function, "Sets a watcher listener function" );
			this.on( "change", listener );
		}

		close() {
			assert.ok( true, "Calls watcher.close" );
		}
	}

	const CacheItem = cacheItemInjector({
		fs: {
			watch( path, listener ) {
				return new Watcher( path, listener );
			}
		}
	})[ "default" ];

	let item;

	item = new CacheItem( "foo" );
	assert.ok( !item.watcher, "Does not have an initial watcher" );
	assert.strictEqual( item.toValue(), "foo", "Returns the correct data" );

	item = new CacheItem( "foo" );
	item.watch( () => {
		assert.ok( true, "Calls the watcher listener" );
	});
	assert.ok( item.watcher instanceof Watcher, "Does have a file watcher" );
	assert.strictEqual( item.toValue(), "foo", "Returns the correct data" );
	item.watcher.emit( "change" );
	item.unwatch();

});


test( "Cache", assert => {

	assert.expect( 14 );

	class Watcher extends EventEmitter {
		constructor( path, listener ) {
			super();
			assert.strictEqual( path, "foo", "Sets the correct path on the file watcher" );
			assert.ok( listener instanceof Function, "Sets a watcher listener function" );
			this.on( "change", listener );
		}

		close() {
			assert.ok( true, "Calls watcher.close" );
		}
	}

	const CacheItem = cacheItemInjector({
		fs: {
			watch( path, listener ) {
				return new Watcher( path, listener );
			}
		}
	})[ "default" ];

	const Cache = cacheInjector({
		"./item": CacheItem
	})[ "default" ];

	let cache;

	cache = new Cache();
	assert.strictEqual( cache.get(), null, "Does not have any cache items initially" );

	cache.set({ foo: "foo" });
	assert.deepEqual( Object.keys( cache.cache ), [ "foo" ], "Does have a cache entry for foo" );
	assert.ok( cache.cache.foo instanceof CacheItem, "cache.foo is a CacheItem" );
	assert.propEqual( cache.get(), { foo: "foo" }, "Returns the correct cache item data" );

	cache.set({ foo: "bar" });
	assert.propEqual( cache.get(), { foo: "bar" }, "Returns the new cache item data" );

	cache.clear();
	assert.strictEqual( cache.get(), null, "Does not have any cache items after clearing" );

	cache = new Cache( "foo" );
	cache.set({
		foo: "foo",
		bar: "bar"
	});
	assert.ok( cache.cache.foo.watcher instanceof Watcher, "Sets up watchers" );
	assert.propEqual(
		cache.get(),
		{ foo: "foo", bar: "bar" },
		"Returns the correct cache item data"
	);

	cache.cache.foo.watcher.emit( "change" );
	assert.strictEqual( cache.get(), null, "Clears the cache when a file watcher changes" );

	cache = new Cache( "foo" );
	cache.set({
		foo: {}
	});
	assert.notOk(
		cache.cache.foo.watcher instanceof Watcher,
		"Doesn't set up watcher if data is not a string"
	);

	cache = new Cache( "foo" );
	cache.set({
		foo: ""
	});
	assert.notOk(
		cache.cache.foo.watcher instanceof Watcher,
		"Doesn't set up watcher if data has no length"
	);

});


test( "Cache registry", assert => {

	assert.expect( 4 );

	class Cache {
		clear() {
			assert.ok( true, "Called clear" );
		}
	}

	const {
		providerCache,
		playerCache,
		clearCache
	} = registryInjector({
		"./cache": Cache
	});

	assert.ok( providerCache instanceof Cache, "Exports the providerCache object" );
	assert.ok( playerCache instanceof Cache, "Exports the playerCache object" );

	clearCache();

});
