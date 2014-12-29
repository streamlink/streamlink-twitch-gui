define(function() {

	var slice = [].slice;

	return function denodify( func, thisArg ) {
		// return the denodified function
		return function() {
			var args  = slice.call( arguments ),
			    defer = Promise.defer();

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
		};
	};

});
