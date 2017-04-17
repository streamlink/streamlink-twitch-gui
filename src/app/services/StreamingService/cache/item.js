import { watch } from "fs";


export default class CacheItem {
	constructor( data, listener ) {
		this.data = data;
		if ( typeof data === "string" ) {
			this.watcher = watch( data, listener );
		}
	}

	close() {
		if ( this.watcher ) {
			this.watcher.close();
		}
	}

	toValue() {
		return this.data;
	}
}
