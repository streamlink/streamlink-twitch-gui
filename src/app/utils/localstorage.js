define(function() {

	return function upgradeLocalstorage() {
		var LS  = window.localStorage;

		var old = LS.getItem( "app" );
		if ( old === null ) { return; }

		try {
			old = JSON.parse( old );
		} catch( e ) {
			return;
		}

		Object.keys( old ).forEach(function( key ) {
			var data = {};
			data[ key.toLowerCase() ] = old[ key ];
			LS.setItem( key, JSON.stringify( data ) );
		});

		LS.removeItem( "app" );
	};

});
