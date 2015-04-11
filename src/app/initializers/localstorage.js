define(function() {

	var LS = window.localStorage;

	function upgradeLocalstorage() {
		var old = LS.getItem( "app" );
		if ( old === null ) { return; }

		try {
			old = JSON.parse( old );
		} catch( e ) {
			return;
		}

		Object.keys( old ).forEach(function( key ) {
			var data = {};
			data[ key ] = old[ key ];
			LS.setItem(
				key.toLowerCase(),
				JSON.stringify( data )
			);
		});

		LS.removeItem( "app" );
	}

	upgradeLocalstorage();

});
