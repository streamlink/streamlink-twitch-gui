import { langs } from "config";
import qualities from "models/LivestreamerQualities";


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
		if ( !settings.hasOwnProperty( key ) ) { return; }
		settings[ renamedProps[ key ] ] = settings[ key ];
		delete settings[ key ];
	});

	// remove unused or disabled language filters
	Object.keys( settings.gui_langfilter || {} ).forEach(function( code ) {
		var lang = langs[ code ];
		if ( !lang || lang.disabled ) {
			delete settings.gui_langfilter[ code ];
		}
	});

	// map quality number IDs to strings
	_upgradeQuality( settings );

	LS.setItem( "settings", JSON.stringify( data ) );
}

function upgradeChannelSettings() {
	var data = JSON.parse( LS.getItem( "channelsettings" ) );
	// data key has a dash in it
	if ( !data || !data[ "channel-settings" ] ) { return; }
	var channelsettings = data[ "channel-settings" ].records;

	Object.keys( channelsettings ).forEach(function( key ) {
		let settings = channelsettings[ key ];

		// map quality number IDs to strings
		_upgradeQuality( settings );
	});

	LS.setItem( "channelsettings", JSON.stringify( data ) );
}

function _upgradeQuality( settings ) {
	if ( !settings.hasOwnProperty( "quality" ) ) { return; }
	if ( settings.quality === null ) { return; }
	if ( !qualities.hasOwnProperty( settings.quality || 0 ) ) { return; }

	settings.quality = qualities[ settings.quality || 0 ].id;
}


upgradeLocalstorage();
upgradeSettings();
upgradeChannelSettings();
