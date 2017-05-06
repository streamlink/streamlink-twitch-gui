import { watch } from "fs";


export default class CacheItem {
	constructor( data ) {
		this.data = data;
	}

	watch( listener ) {
		this.unwatch();
		this.watcher = watch( this.data, listener );
	}

	unwatch() {
		if ( this.watcher ) {
			this.watcher.close();
			this.watcher = null;
		}
	}

	toValue() {
		return this.data;
	}
}
