/**
 * @constructor
 */
function NotificationProvider() {}

/**
 * @typedef {{title: String, message: String}} NotificationMessageList
 */

/**
 * @param {Object} data
 * @param {String} data.title
 * @param {(String|NotificationMessageList[])} data.message
 * @param {String} data.icon
 * @param {Function} data.click
 * @returns {Promise}
 */
NotificationProvider.prototype.notify = function notify( data ) {
	let self = this;

	if ( Array.isArray( data.message ) ) {
		data.message = data.message.mapBy( "title" ).join( ", " );
	}

	return new Promise(function( resolve, reject ) {
		self.provider.notify( data, function( err ) {
			if ( err ) {
				reject( err );
			} else {
				resolve();
			}
		});
	});
};


export default NotificationProvider;
