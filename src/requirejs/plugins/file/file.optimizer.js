define([
	"requirejs/utils/escape",
	"requirejs/utils/fetch.optimizer",
	"requirejs/utils/write"
], function(
	escape,
	fetch,
	write
) {

	var buildMap = {};


	return {
		load: function( name, req, onload ) {
			var url = req.toUrl( name );

			fetch( url, function( text ) {
				buildMap[ name ] = "\"" + escape( text ) + "\"";
				onload( text );
			}, onload.error );
		},

		write: write.bind( null, buildMap )
	};

});
