import { get } from "@ember/object";


export default class NotificationStreamCacheItem {
	/**
	 * @param {TwitchStream} stream
	 */
	constructor( stream ) {
		this.id = get( stream, "id" );
		this.since = get( stream, "created_at" );
		this.fails = 0;
	}

	/**
	 * @param {TwitchStream[]} streams
	 * @returns {Number}
	 */
	findStreamIndex( streams ) {
		for ( let id = this.id, i = 0, l = get( streams, "length" ); i < l; i++ ) {
			if ( get( streams[ i ], "id" ) === id ) {
				return i;
			}
		}
		return -1;
	}

	/**
	 * @param {TwitchStream} stream
	 * @returns {Boolean}
	 */
	isNotNewer( stream ) {
		return this.since >= get( stream, "created_at" );
	}
}
