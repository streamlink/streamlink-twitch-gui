import {
	players,
	langs
} from "config";
import qualities from "models/stream/qualities";


const LS = window.localStorage;
const { hasOwnProperty } = {};


function upgradeLocalstorage() {
	let old = LS.getItem( "app" );
	if ( old === null ) { return; }

	try {
		old = JSON.parse( old );
	} catch ( e ) {
		return;
	}

	Object.keys( old ).forEach(function( key ) {
		const data = {};
		data[ key ] = old[ key ];
		LS.setItem(
			key.toLowerCase(),
			JSON.stringify( data )
		);
	});

	LS.removeItem( "app" );
}

function upgradeSettings() {
	const data = JSON.parse( LS.getItem( "settings" ) );
	if ( !data || !data.settings || !data.settings.records[1] ) { return; }
	const settings = data.settings.records[ 1 ];

	if ( typeof settings.gui_minimize !== "number" ) {
		settings.gui_minimize = 0;
	}

	if ( settings.gui_homepage === "/user/following" ) {
		settings.gui_homepage = "/user/followedStreams";
	}

	// remove old qualities setting (pre-exclusion streamlink/livestreamer quality selection)
	if ( typeof settings.qualities === "object" && typeof settings.qualities.source === "string" ) {
		delete settings[ "qualities" ];
	}

	// remove old livestreamer data
	delete settings[ "livestreamer" ];
	delete settings[ "livestreamer_params" ];

	// translate old player data into the player presets format
	if ( typeof settings.player === "string" ) {
		settings.player = {
			"default": {
				"exec": settings[ "player" ] || "",
				"args": settings[ "player_params" ] || ""
			}
		};
		delete settings[ "player_params" ];
	}

	// make sure that default player params are set/updated once a new one gets added
	if ( typeof settings.player === "object" ) {
		Object.keys( players ).forEach(function( name ) {
			if ( !settings.player.hasOwnProperty( name ) ) {
				settings.player[ name ] = {
					"exec": "",
					"args": "",
					"params": {}
				};
			}
			let playerParams = settings.player[ name ].params;
			// iterate player preset params
			players[ name ].params.forEach(function( param ) {
				// don't overwrite already existing values
				if ( playerParams.hasOwnProperty( param.name ) ) { return; }
				playerParams[ param.name ] = param.default;
			});
		});
	}

	// remove unused or disabled language filters
	Object.keys( settings.gui_langfilter || {} ).forEach(function( code ) {
		const lang = langs[ code ];
		if ( !lang || lang.disabled ) {
			delete settings.gui_langfilter[ code ];
		}
	});

	// update notification provider
	if ( [ "libnotify", "freedesktop" ].includes( settings.notify_provider ) ) {
		settings.notify_provider = "native";
	}

	// move old attributes
	moveAttributes( settings, {
		livestreamer_oauth: "streaming.oauth",
		gui_flagsvisible: "stream_show_flag",
		gui_gamevisible: "stream_show_info",
		gui_streamclick_mid: "stream_click_middle",
		gui_streamclick_mod: "stream_click_modify"
	});

	// use new "streaming" model fragment
	moveAttributesIntoFragment( settings, "streaming", {
		streamprovider: "provider",
		streamproviders: "providers",
		quality: "quality",
		qualities: "qualities",
		quality_presets: "qualitiesOld",
		streamprovider_oauth: "oauth",
		player_passthrough: "player_passthrough",
		player_reconnect: "player_reconnect",
		player_no_close: "player_no_close",
		hls_live_edge: "hls_live_edge",
		hls_segment_threads: "hls_segment_threads",
		retry_open: "retry_open",
		retry_streams: "retry_streams"
	});

	// translate old quality ID setting
	qualityIdToName( settings.streaming );

	LS.setItem( "settings", JSON.stringify( data ) );
}


function moveAttributes( settings, attributes ) {
	for ( const [ oldAttr, newAttrPath ] of Object.entries( attributes ) ) {
		if ( !hasOwnProperty.call( settings, oldAttr ) ) { continue; }
		const path = newAttrPath.split( "." );
		const newAttr = path.pop();
		let obj = settings;
		for ( const elem of path ) {
			if ( !hasOwnProperty.call( obj, elem ) ) {
				obj[ elem ] = {};
			}
			obj = obj[ elem ];
		}
		obj[ newAttr ] = settings[ oldAttr ];
		delete settings[ oldAttr ];
	}
}

// Similar to moveAttributes, but faster (everything belongs to the same fragment)
function moveAttributesIntoFragment( settings, fragment, attributes ) {
	if ( !hasOwnProperty.call( settings, fragment ) ) {
		settings[ fragment ] = {};
	}
	const fragmentObj = settings[ fragment ];
	for ( const [ oldAttr, newAttr ] of Object.entries( attributes ) ) {
		if ( !hasOwnProperty.call( settings, oldAttr ) ) { continue; }
		fragmentObj[ newAttr ] = settings[ oldAttr ];
		delete settings[ oldAttr ];
	}
}


function upgradeChannelSettings() {
	const data = JSON.parse( LS.getItem( "channelsettings" ) );
	// data key has a dash in it
	if ( !data || !data[ "channel-settings" ] ) { return; }
	const channelsettings = data[ "channel-settings" ].records;

	Object.keys( channelsettings ).forEach(function( key ) {
		let settings = channelsettings[ key ];

		// map quality number IDs to strings
		qualityIdToName( settings );
	});

	LS.setItem( "channelsettings", JSON.stringify( data ) );
}

function qualityIdToName( obj ) {
	if ( !hasOwnProperty.call( obj, "quality" ) ) { return; }
	if ( obj.quality === null ) { return; }
	if ( !hasOwnProperty.call( qualities, obj.quality || 0 ) ) { return; }

	obj.quality = qualities[ obj.quality || 0 ].id;
}


upgradeLocalstorage();
upgradeSettings();
upgradeChannelSettings();
