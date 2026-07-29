import CacheItem from "./item";


export default class Cache {
	constructor( ...watchProperties ) {
		/** @type {Object.<String,CacheItem>} */
		this.cache = {};
		/** @type {String[]} */
		this.watchProperties = watchProperties;
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
		const watchProperties = this.watchProperties;
		const callback = () => this.clear();

		Object.keys( obj )
			.forEach( key => {
				const data = obj[ key ];
				const item = cache[ key ] = new CacheItem( data );
				if ( typeof data === "string" && data.length && watchProperties.includes( key ) ) {
					item.watch( callback );
				}
			});
	}

	clear() {
		const cache = this.cache;
		Object.keys( cache )
			.forEach( key => {
				cache[ key ].unwatch();
				delete cache[ key ];
			});
	}
}
