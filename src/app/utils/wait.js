/**
 * @param {number} time
 * @param {boolean?} fail
 * @returns {Function}
 */
function wait( time, fail ) {
	return function waitPromise( data ) {
		return new Promise(function( resolve, reject ) {
			setTimeout(function() {
				( fail ? reject : resolve )( data );
			}, time );
		});
	};
}


export default wait;
