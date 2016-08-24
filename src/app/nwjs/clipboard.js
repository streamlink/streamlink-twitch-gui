import nwGui from "nwjs/nwGui";


function getClipboard() {
	try {
		return nwGui.Clipboard.get();
	} catch ( e ) {
		throw new Error( "Clipboard not initialized" );
	}
}


export default {
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
