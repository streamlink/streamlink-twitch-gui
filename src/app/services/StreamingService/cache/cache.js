import CacheItem from "./item";


export default class Cache {
	constructor() {
		/** @type {Object.<String,CacheItem>} */
		this.cache = {};
	}

	get() {
		const cache = this.cache;
		const kCache = Object.keys( cache );

		return !kCache.length
			? null
			: kCache.reduce( ( obj, key ) => {
				obj[ key ] = cache[ key ].toValue();
				return obj;
			}, {} );
	}

	set( obj ) {
		this.clear();

		const cache = this.cache;
		const callback = () => this.clear();
		Object.keys( obj )
			.forEach( key => {
				cache[ key ] = new CacheItem( obj[ key ], callback );
			});
	}

	clear() {
		const cache = this.cache;
		Object.keys( cache )
			.forEach( key => {
				cache[ key ].close();
				delete cache[ key ];
			});
	}
}
