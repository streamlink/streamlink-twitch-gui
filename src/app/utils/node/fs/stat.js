define([
	"utils/node/denodify",
	"commonjs!fs"
], function(
	denodify,
	FS
) {

	var fsStat = denodify( FS.stat );


	return function stat( path, check ) {
		var promise = fsStat( path );

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
