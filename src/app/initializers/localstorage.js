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

		var renamedProps = {
			"gui_flagsvisible": "stream_show_flag",
			"gui_gamevisible" : "stream_show_info",
			"gui_streamclick_mid": "stream_click_middle",
			"gui_streamclick_mod": "stream_click_modify"
		};

		Object.keys( renamedProps ).forEach(function( key ) {
			if ( !( key in settings ) ) { return; }
			settings[ renamedProps[ key ] ] = settings[ key ];
			delete settings[ key ];
		});

		LS.setItem( "settings", JSON.stringify( data ) );
	}

	upgradeLocalstorage();
	upgradeSettings();

});
