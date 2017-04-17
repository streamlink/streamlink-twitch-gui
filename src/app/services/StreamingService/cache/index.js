import CacheItem from "./item";

/**
 * Cache object with file watchers
 * @type Object.<String,CacheItem>
 */
export const cache = {};


export function setupCache( obj ) {
	clearCache();
	Object.keys( obj )
		.forEach( key => {
			cache[ key ] = new CacheItem( obj[ key ], clearCache );
		});
}

export function clearCache() {
	Object.keys( cache )
		.forEach( key => {
			cache[ key ].close();
			delete cache[ key ];
		});
}

export function getCache() {
	const kCache = Object.keys( cache );

	return !kCache.length
		? null
		: kCache.reduce( ( obj, key ) => {
			obj[ key ] = cache[ key ].toValue();
			return obj;
		}, {} );
}
