// define an unused dependency, so requirejs doesn't insert the requirejs-require here
define( [ "ember" ], function() {

	var FS = require( "fs" );

	/**
	 * Does the file exist?
	 * @param {string} file
	 * @param {Function?} check
	 * @returns {Promise}
	 */
	return function stat( file, check ) {
		var defer = Promise.defer();

		FS.stat( file, function( err, stat ) {
			if ( err || check && !check( stat ) ) {
				defer.reject( err );
			} else {
				defer.resolve( file );
			}
		});

		return defer.promise;
	};

});
