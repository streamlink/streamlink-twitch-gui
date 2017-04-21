import {
	module,
	test
} from "qunit";
import cacheItemInjector from "inject-loader?fs!services/StreamingService/cache/item";
import cacheInjector from "inject-loader?./item!services/StreamingService/cache/cache";
import { EventEmitter } from "events";


module( "services/StreamingService/cache" );


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

	const dataObj = { foo: "foo" };
	item = new CacheItem( dataObj );

	assert.ok( !item.watcher, "Does not have a watcher when data is not a string" );
	assert.strictEqual( item.toValue(), dataObj, "Returns the correct data" );
	item.close();

	const listener = () => {
		assert.ok( true, "Calls the watcher listener" );
	};
	item = new CacheItem( "foo", listener );

	assert.ok( item.watcher instanceof Watcher, "Does have a file watcher" );
	assert.strictEqual( item.toValue(), "foo", "Returns the correct data" );
	item.watcher.emit( "change" );
	item.close();

});


test( "Cache", assert => {

	assert.expect( 11 );

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

	let cache = new Cache();

	assert.strictEqual( cache.get(), null, "Does not have any cache items initially" );

	const fooObj = { foo: "foo" };
	const barObj = { bar: "bar" };

	cache.set({
		foo: fooObj
	});
	assert.deepEqual( Object.keys( cache.cache ), [ "foo" ], "Does have a cache entry for foo" );
	assert.ok( cache.cache.foo instanceof CacheItem, "cache.foo is a CacheItem" );
	assert.propEqual( cache.get(), { foo: fooObj }, "Returns the correct cache item data" );

	cache.set({
		foo: barObj
	});
	assert.propEqual( cache.get(), { foo: barObj }, "Returns the new cache item data" );

	cache.clear();
	assert.strictEqual( cache.get(), null, "Does not have any cache items after clearing" );

	cache.set({
		foo: "foo",
		bar: barObj
	});
	assert.propEqual(
		cache.get(),
		{ foo: "foo", bar: barObj },
		"Returns the correct cache item data"
	);

	cache.cache.foo.watcher.emit( "change" );
	assert.strictEqual( cache.get(), null, "Clears the cache when a file watcher changes" );

});
