define( [ "ember" ], function( Ember ) {

	return function( dfd, traverse ) {
		var	deferred = new Ember.Deferred(),
			result,
			images;

		dfd.then( success, error );

		function success( res ) {
			result = res;
			images = traverse( res ).map(function( src ) {
				var image = new Image;
				image.addEventListener( "load", loaded.bind( image ), false );
				// ignore all image errors... twitch will send an image placeholder instead
				image.addEventListener( "error", loaded.bind( image ), false );
				image.src = src;

				return image;
			});
		}

		function error( err ) {
			deferred.reject( err );
		}

		function loaded() {
			// remove the loaded image from the remaining images list
			var index = images.indexOf( this );
			if ( index !== -1 ) {
				images.splice( index, 1 );
			}

			// remaining images empty? then we're finished preloading
			if ( images.length === 0 ) {
				deferred.resolve( result );
			}
		}

		return deferred;
	};

});
