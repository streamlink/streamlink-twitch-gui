define(function() {

	return function( path, onSuccess, onFailure ) {
		var xhr = new XMLHttpRequest();

		xhr.onload = function() {
			var status = xhr.status;
			if ( status < 100 || status > 599 ) {
				onFailure( new TypeError( "Network request failed" ) );
			} else {
				onSuccess( xhr.response || xhr.responseText );
			}
		};

		xhr.onerror = function() {
			onFailure( new TypeError( "Network request failed" ) );
		};

		xhr.open( "GET", path, true );
		xhr.send( null );
	};

});
