import { Clipboard } from "nwjs/nwGui";


function getClipboard() {
	try {
		return Clipboard.get();
	} catch ( e ) {
		throw new Error( "Clipboard not initialized" );
	}
}


export function get() {
	return getClipboard().get( "text" );
}

export function set( str ) {
	return new Promise(function( resolve ) {
		getClipboard().set( String( str ), "text" );
		resolve( str );
	});
}
