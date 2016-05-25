define(function() {

	var slice = [].slice;


	/**
	 * Let native Node.js methods return promises
	 * @param {Function} func
	 * @param {Object?} thisArg
	 * @returns {denodified}
	 */
	function denodify( func, thisArg ) {
		/**
		 * The denodified function
		 * @typedef denodified
		 * @returns {Promise}
		 */
		function denodified() {
			var args  = slice.call( arguments );
			var defer = Promise.defer();

			function callback( err, value ) {
				if ( err ) {
					defer.reject( err );
				} else {
					// resolve with an array of all callback arguments if there are more than one
					// ignoring the error argument of course
					defer.resolve( arguments.length > 2
						? slice.call( arguments, 1 )
						: value
					);
				}
			}

			// the callback is always the last argument
			func.apply( thisArg, args.concat( callback ) );

			return defer.promise;
		}

		return denodified;
	}


	return denodify;

});
