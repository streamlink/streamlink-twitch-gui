define(function() {

	/**
	 * @param {number} time
	 * @param {boolean?} fail
	 * @returns {Function}
	 */
	return function wait( time, fail ) {
		return function waitPromise( data ) {
			return new Promise(function( resolve, reject ) {
				setTimeout(function() {
					( fail ? reject : resolve )( data );
				}, time );
			});
		};
	};

});
