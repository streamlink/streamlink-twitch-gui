module.exports = function( n, delay, fn, logger ) {
	const retry = i => async err => {
		if ( logger && err ) {
			logger( err );
		}
		await new Promise( resolve => setTimeout( resolve, delay ) );
		return fn( i, n );
	};

	let promise = Promise.reject();
	for ( let i = 1; i <= n; i++ ) {
		promise = promise.catch( retry( i ) );
	}

	return promise;
};
