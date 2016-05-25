define([
	"EmberHtmlbars",
	"requirejs/utils/fetch.optimizer",
	"requirejs/utils/write"
], function(
	EmberHtmlbars,
	fetch,
	write
) {

	var precompile = EmberHtmlbars.precompile;
	var buildMap   = {};


	return {
		load: function( name, req, onload ) {
			var url = req.toUrl( name + ".hbs" );
			var compiled;

			fetch( url, function( response ) {
				try {
					compiled = precompile( response ).toString();
					buildMap[ name ] = compiled;
				} catch ( err ) {
					return onload.error( err );
				}
				onload( compiled );
			}, onload.error );
		},

		write: write.bind( null, buildMap )
	};

});
