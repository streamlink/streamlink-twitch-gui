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

	function upgradeSettings() {
		var data = JSON.parse( LS.getItem( "settings" ) );
		if ( !data || !data.settings || !data.settings.records[1] ) { return; }
		var settings = data.settings.records[1];

		if ( settings.gui_homepage === "/user/following" ) {
			settings.gui_homepage = "/user/followedStreams";
		}

		LS.setItem( "settings", JSON.stringify( data ) );
	}

	upgradeLocalstorage();
	upgradeSettings();

});
