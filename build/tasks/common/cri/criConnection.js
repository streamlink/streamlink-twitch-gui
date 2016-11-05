var CRI = require( "chrome-remote-interface" );


/**
 * @returns {Promise}
 */
module.exports = function( options ) {
	function connect() {
		return CRI({
			host: options.host,
			port: options.port
		})
			.then(function( chrome ) {
				chrome.Console.enable();
				chrome.Runtime.enable();

				return chrome;
			});
	}

	// wait a second and try to connect at least 3 times before failing
	var promise = Promise.reject();
	function retry() {
		return new Promise(function( resolve ) {
			setTimeout( resolve, 1000 );
		})
			.then( connect );
	}
	for ( var i = 0, n = 3; i < n; i++ ) {
		promise = promise.catch( retry );
	}

	return promise;
};
