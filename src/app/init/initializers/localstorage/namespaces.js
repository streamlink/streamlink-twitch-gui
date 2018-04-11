export default function( LS ) {
	const old = LS.getItem( "app" );
	if ( old === null ) { return; }

	try {
		for ( const [ ns, obj ] of Object.entries( JSON.parse( old ) ) ) {
			const key = ns.toLowerCase();
			const value = JSON.stringify( obj );
			LS.setItem( key, value );
		}
	} catch ( e ) {
		return;
	}

	LS.removeItem( "app" );
}
