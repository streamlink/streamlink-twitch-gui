define( [ "jquery" ], function( $ ) {

	return function( dfd, traverse ) {
		var	deferred = $.Deferred(),
			result,
			images;

		dfd.then(function( res ) {
			result = res;
			images = traverse( res ).map(function( src ) {
				var image = new Image;
				image.addEventListener( "load", loaded.bind( image ), false );
				image.addEventListener( "error", error.bind( image ), false );
				image.src = src;

				return image;
			});
		}, error );

		function loaded() {
			var index = images.indexOf( this );
			if ( index !== -1 ) {
				images.splice( index, 1 );
			}

			if ( images.length === 0 ) {
				deferred.resolve( result );
			}
		}

		function error() {
			deferred.reject();
		}

		return deferred.promise();
	};

});
