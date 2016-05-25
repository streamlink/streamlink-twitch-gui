define([
	"nwjs/nwGui"
], function(
	nwGui
) {

	function getClipboard() {
		try {
			return nwGui.Clipboard.get();
		} catch ( e ) {
			throw new Error( "Clipboard not initialized" );
		}
	}


	return {
		get: function() {
			return getClipboard().get( "text" );
		},

		set: function( str ) {
			return new Promise(function( resolve ) {
				getClipboard().set( String( str ), "text" );
				resolve( str );
			});
		}
	};

});
