export default class NotificationStreamCacheItem {
	/**
	 * @param {TwitchStream} stream
	 */
	constructor( stream ) {
		this.id = stream.id;
		this.since = stream.started_at;
		this.fails = 0;
	}

	/**
	 * @param {TwitchStream[]} streams
	 * @returns {Number}
	 */
	findStreamIndex( streams ) {
		for ( let id = this.id, i = 0, l = streams.length; i < l; i++ ) {
			if ( streams[ i ].id === id ) {
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
		return this.since >= stream.started_at;
	}
}
