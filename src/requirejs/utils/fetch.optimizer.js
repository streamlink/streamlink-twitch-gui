define(function() {

	var fs = require.nodeRequire( "fs" );

	return function( path, onSuccess, onFailure ) {
		var buffer;
		try {
			buffer = fs.readFileSync( path );
		} catch ( err ) {
			return onFailure( err );
		}
		return onSuccess( buffer.toString() );
	};

});
