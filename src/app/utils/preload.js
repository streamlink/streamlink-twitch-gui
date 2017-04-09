import { makeArray } from "ember";


function preload( withError, list ) {
	if ( list === undefined ) {
		list = withError;
		withError = false;
	}

	function promiseImage( src ) {
		if ( !src ) {
			return Promise.resolve();
		}

		return new Promise(function( resolve, reject ) {
			let image = new Image();

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
				let resources = response.mapBy
					? response.mapBy( traverse )
					: makeArray( response ).mapBy( traverse );

				// data instanceof Ember.Enumerable
				resources = resources && resources.toArray
					? resources.toArray()
					: makeArray( resources );

				// preload images
				promises.push( ...resources.map( promiseImage ) );
				return promises;
			}, [] )
		)
			// return the original response
			.then(function preloadFulfilled() { return response; });
	};
}


export default preload;
