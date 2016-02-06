define([
	"requirejs/utils/fetch.dev"
], function(
	fetch
) {

	return {
		load: function( name, req, onload ) {
			var url = req.toUrl( name );

			fetch( url, function( response ) {
				onload( response );
			}, onload.error );
		}
	};

});
