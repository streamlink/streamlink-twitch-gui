define( [ "ember" ], function( Ember ) {

	var concat = [].concat,
	    get = Ember.getWithDefault,
	    makeArray = Ember.makeArray,
	    isNone = Ember.isNone;

	return function preload( withError, list ) {
		if ( list === undefined ) {
			list = withError;
			withError = false;
		}

		function promiseImage( src ) {
			if ( isNone( src ) ) {
				return Promise.resolve();
			}

			var defer = Promise.defer();
			var image = new Image();
			image.addEventListener( "load", defer.resolve, false );
			image.addEventListener( "error", withError ? defer.reject : defer.resolve, false );
			image.src = src;
			return defer.promise;
		}

		return function promisePreload( response ) {
			// create a new promise containing all image preload promises
			return Promise.all(
				// create a flat array out of all traversal strings
				makeArray( list ).reduce(function createPromiseList( promises, traverse ) {
					// traverse response data
					var resources = get( response, traverse, [] );

					// data instanceof Ember.Enumerable
					resources = resources && resources.toArray
						? resources.toArray()
						: makeArray( resources );

					// preload images
					return concat.apply( promises, resources.map( promiseImage ) );
				}, [] )
			)
				// return the original response
				.then(function preloadFulfilled() { return response; });
		};
	};

});
