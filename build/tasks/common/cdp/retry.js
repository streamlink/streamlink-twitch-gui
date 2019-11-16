module.exports = function( n, delay, fn ) {
	const retry = i => () => new Promise( resolve => setTimeout( resolve, delay ) )
		.then( () => fn( i, n ) );

	let promise = Promise.reject();
	for ( let i = 1; i <= n; i++ ) {
		promise = promise.catch( retry( i ) );
	}

	return promise;
};
