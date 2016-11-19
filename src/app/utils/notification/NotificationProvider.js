/**
 * @typedef {{title: String, message: String}} NotificationMessageList
 */


/**
 * @class NotificationProvider
 */
export default class NotificationProvider {
	/**
	 * Test notification provider
	 * @returns {Promise}
	 */
	static test() {
		return Promise.reject();
	}

	/**
	 * @param {Object} data
	 * @param {String} data.title
	 * @param {(String|NotificationMessageList[])} data.message
	 * @param {String} data.icon
	 * @param {Function} data.click
	 * @returns {Promise}
	 */
	notify( data ) {
		let err = new Error( "Not implemented" );
		err.data = data;
		throw err;
	}


	/**
	 * @param {(String|NotificationMessageList[])} message
	 * @returns {String}
	 */
	static getMessageAsString( message ) {
		return Array.isArray( message )
			? message.map( message => message.title ).join( ", " )
			: message;
	}
}
