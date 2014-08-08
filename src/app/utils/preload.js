define( [ "ember" ], function( Ember ) {

	return function preload( withError, list ) {
		if ( list === undefined ) {
			list = withError;
			withError = false;
		}

		function createImagePromise( src ) {
			return new Promise(function promiseImagePreload( resolve, reject ) {
				var image = new Image();
				image.addEventListener( "load", resolve, false );
				image.addEventListener( "error", withError ? reject : resolve, false );
				image.src = src;
			});
		}

		return function promisePreload( response ) {
			// create a new promise containing all image preload promises
			return Promise.all(
				// create a flat array out of all traversal strings
				Ember.makeArray( list ).reduce(function createPromiseList( promises, traverse ) {
					return [].concat.apply(
						promises,
						// traverse response data
						Ember.getWithDefault( response, traverse, [] )
							.toArray()
							// preload images
							.map( createImagePromise )
					);
				}, [] )
			)
				// return the original response
				.then(function preloadFulfilled() { return response; });
		}
	};

});
