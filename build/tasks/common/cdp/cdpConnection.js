const CDP = require( "chrome-remote-interface" );


/**
 * @returns {Promise}
 */
module.exports = function( options ) {
	const { host, port } = options;

	function connect() {
		return CDP({ host, port });
	}

	// wait a second and try to connect at least 3 times before failing
	let promise = Promise.reject();
	function retry() {
		return new Promise( resolve => setTimeout( resolve, 1000 ) )
			.then( connect );
	}
	for ( let i = 0, n = 3; i < n; i++ ) {
		promise = promise.catch( retry );
	}

	return promise;
};
