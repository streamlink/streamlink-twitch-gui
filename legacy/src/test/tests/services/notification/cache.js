import { module, test } from "qunit";

import CacheItem from "services/notification/cache/item";
import cacheInjector from "inject-loader?config!services/notification/cache";


module( "services/notification/cache", function() {
	test( "NotificationStreamCacheItem", function( assert ) {
		const item = new CacheItem({
			id: "1",
			started_at: 1000
		});
		assert.propEqual( item, {
			id: "1",
			since: 1000,
			fails: 0
		}, "Has the correct properties set" );

		assert.ok( item.isNotNewer({ started_at: 1000 }), "Is not newer" );
		assert.notOk( item.isNotNewer({ started_at: 1001 }), "Is newer" );

		const streams = [
			{ id: "3" },
			{ id: "2" },
			{ id: "1" }
		];

		assert.strictEqual( item.findStreamIndex( streams ), 2, "Finds a stream with the same ID" );
		streams.pop();
		assert.strictEqual( item.findStreamIndex( streams ), -1, "Doesn't finds any streams" );
	});

	test( "NotificationStreamCache", function( assert ) {
		const { cache, cacheClear, cacheAdd, cacheFill } = cacheInjector({
			config: {
				notification: { fails: { channels: 3 } }
			}
		});

		assert.propEqual( cache, [], "Cache is empty initially" );

		cacheAdd({ id: "1", started_at: 1000 });
		assert.strictEqual( cache.length, 1, "Adds a new item to the cache" );

		cacheAdd({ id: "2", started_at: 2000 });
		cacheAdd({ id: "1", started_at: 3000 });
		cacheAdd({ id: "2", started_at: 4000 });
		assert.strictEqual( cache.length, 2, "Doesn't add duplicates to the cache" );

		cacheClear();
		assert.strictEqual( cache.length, 0, "Clears the cache" );

		// initial streams
		let ret = cacheFill([
			{ id: "1", started_at: 1000 },
			{ id: "2", started_at: 2000 }
		], true );
		assert.propEqual( ret, [], "Returns an empty array on first run" );
		assert.propEqual( cache, [
			{ id: "1", since: 1000, fails: 0 },
			{ id: "2", since: 2000, fails: 0 }
		], "Cache has the correct items" );

		// new streams
		ret = cacheFill([
			{ id: "1", started_at: 1000 },
			{ id: "2", started_at: 2000 },
			{ id: "3", started_at: 3000 },
			{ id: "4", started_at: 4000 }
		]);
		assert.propEqual( ret, [
			{ id: "3", started_at: 3000 },
			{ id: "4", started_at: 4000 }
		], "Returns the new streams" );
		assert.propEqual( cache, [
			{ id: "1", since: 1000, fails: 0 },
			{ id: "2", since: 2000, fails: 0 },
			{ id: "3", since: 3000, fails: 0 },
			{ id: "4", since: 4000, fails: 0 }
		], "Cache has the correct items" );

		// reset fails of known streams, increase fails of offline streams and update uptime
		// artificially set fail counters
		cache[0].fails = 1;
		cache[1].fails = 2;
		ret = cacheFill([
			{ id: "1", started_at: 1000 },
			{ id: "3", started_at: 5000 }
		]);
		assert.propEqual( ret, [
			{ id: "3", started_at: 5000 }
		], "Returns streams with new uptime" );
		assert.propEqual( cache, [
			{ id: "1", since: 1000, fails: 0 },
			{ id: "2", since: 2000, fails: 3 },
			{ id: "4", since: 4000, fails: 1 },
			{ id: "3", since: 5000, fails: 0 }
		], "Cache has the correct items" );

		// remove items with failure counters that exceeded the limit (3)
		ret = cacheFill([
			{ id: "1", started_at: 1000 },
			{ id: "3", started_at: 5000 }
		]);
		assert.propEqual( ret, [], "Doesn't return new items" );
		assert.propEqual( cache, [
			{ id: "1", since: 1000, fails: 0 },
			{ id: "4", since: 4000, fails: 2 },
			{ id: "3", since: 5000, fails: 0 }
		], "Cache has the correct items" );
	});
});
