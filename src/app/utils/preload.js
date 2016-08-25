define([
	"Ember"
], function(
	Ember
) {

	var concat = [].concat;
	var makeArray = Ember.makeArray;


	return function preload( withError, list ) {
		if ( list === undefined ) {
			list = withError;
			withError = false;
		}

		function promiseImage( src ) {
			if ( !src ) {
				return Promise.resolve();
			}

			return new Promise(function( resolve, reject ) {
				var image = new Image();

				image.addEventListener( "load", function() {
					image = null;
					resolve();
				}, false );

				image.addEventListener( "error", function() {
					image = null;
					if ( withError ) {
						reject();
					} else {
						resolve();
					}
				}, false );

				image.src = src;
			});
		}

		return function promisePreload( response ) {
			// create a new promise containing all image preload promises
			return Promise.all(
				// create a flat array out of all traversal strings
				makeArray( list ).reduce(function createPromiseList( promises, traverse ) {
					// traverse response data
					var resources = response.mapBy
						? response.mapBy( traverse )
						: makeArray( response ).mapBy( traverse );

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
