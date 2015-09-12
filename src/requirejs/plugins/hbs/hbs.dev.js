define([
	"EmberHtmlbars",
	"requirejs/utils/fetch.dev"
], function(
	EmberHtmlbars,
	fetch
) {

	var compile = EmberHtmlbars.compile;

	return {
		load: function( name, req, onload ) {
			var url = req.toUrl( name + ".hbs" );

			fetch( url, function( response ) {
				var compiled;
				try {
					compiled = compile( response );
				} catch ( err ) {
					return onload.error( err );
				}
				onload( compiled );
			}, onload.error );
		}
	};

});
