import { notification as notificationConfig } from "config";
import NotificationStreamCacheItem from "./item";


const { fails: { channels: failsChannels } } = notificationConfig;

/** @type {NotificationStreamCacheItem[]} */
export const cache = [];


export function cacheClear() {
	cache.splice( 0, cache.length );
}

/**
 * @param {TwitchStream} stream
 */
export function cacheAdd( stream ) {
	const item = new NotificationStreamCacheItem( stream );
	if ( cache.find( ({ id }) => id === item.id ) ) {
		return;
	}
	cache.push( item );
}

/**
 * @param {TwitchStream[]} streams
 * @param {boolean?} firstRun
 * @returns {TwitchStream[]}
 */
export function cacheFill( streams, firstRun ) {
	// figure out which streams are new
	for ( let item, idx, i = 0, l = cache.length; i < l; i++ ) {
		item = cache[ i ];

		// "indexOfBy"
		// streams are ordered, so most of the time the first item matches
		idx = item.findStreamIndex( streams );

		if ( idx !== -1 ) {
			// existing stream found:
			// has the stream still the same creation date?
			if ( item.isNotNewer( streams[ idx ] ) ) {
				// stream hasn't changed:
				// remove it from streams list
				streams.splice( idx, 1 );
				// reset fails counter
				item.fails = 0;
				// keep the item (is not new)
				continue;
			}

		} else {
			// stream not found (may be offline):
			// increase fails counter
			if ( ++item.fails <= failsChannels ) {
				// keep the item until it has reached failure limit
				continue;
			}
		}

		// remove item from the cache
		cache.splice( i, 1 );
		--i;
		--l;
	}

	// add new streams to cache afterwards
	cache.push( ...streams.map( stream => new NotificationStreamCacheItem( stream ) ) );

	// just fill the cache and return an empty array of new streams on the first run
	if ( firstRun ) {
		return [];
	}

	// return new streams
	return streams;
}
