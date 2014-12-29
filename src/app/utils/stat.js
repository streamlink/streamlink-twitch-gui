define( [ "utils/denodify" ], function( denodify ) {

	var FS = require( "fs" );
	var fs_stat = denodify( FS.stat );

	return function stat( path, check ) {
		var promise = fs_stat( path );

		if ( check instanceof Function ) {
			promise = promise
				.then( check )
				.then(function( result ) {
					if ( !result ) {
						return Promise.reject( result );
					}
				});
		}

		return promise
			.then(function() {
				// always return the file instead of the stats object
				return path;
			});
	};

});
