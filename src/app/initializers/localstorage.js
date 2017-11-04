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

	// move old attributes
	moveAttributes( settings, {
		livestreamer_oauth: "streaming.oauth",
		gui_flagsvisible: "streams.show_flag",
		gui_gamevisible: "streams.show_info",
		gui_streamclick_mid: "streams.click_middle",
		gui_streamclick_mod: "streams.click_modify"
	});

	// use new "gui" model fragment
	moveAttributesIntoFragment( settings, "gui", {
		gui_externalcommands: "externalcommands",
		gui_focusrefresh: "focusrefresh",
		gui_homepage: "homepage",
		gui_integration: "integration",
		gui_minimize: "minimize",
		gui_minimizetotray: "minimizetotray",
		gui_smoothscroll: "smoothscroll",
		gui_theme: "theme"
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

	// use new "streams" model fragment
	moveAttributesIntoFragment( settings, "streams", {
		channel_name: "name",
		gui_closestreampopup: "modal_close_end",
		gui_hidestreampopup: "modal_close_launch",
		gui_openchat: "chat_open",
		gui_openchat_context: "chat_open_context",
		gui_twitchemotes: "twitchemotes",
		gui_vodcastfilter: "filter_vodcast",
		gui_filterstreams: "filter_languages",
		gui_langfilter: "languages",
		stream_show_flag: "show_flag",
		stream_show_info: "show_info",
		stream_info: "info",
		stream_click_middle: "click_middle",
		stream_click_modify: "click_modify"
	});

	// use new "notification" model fragment
	moveAttributesIntoFragment( settings, "notification", {
		notify_enabled: "enabled",
		notify_provider: "provider",
		notify_all: "filter",
		notify_grouping: "grouping",
		notify_click: "click",
		notify_click_group: "click_group",
		notify_click_restore: "click_restore",
		notify_badgelabel: "badgelabel"
	});

	// fix old gui related attribute values
	if ( typeof settings.gui.minimize !== "number" ) {
		settings.gui.minimize = 0;
	}
	if ( typeof settings.gui.minimizetotray !== "boolean" ) {
		settings.gui.minimizetotray = !!settings.gui.minimizetotray;
	}
	if ( settings.gui.homepage === "/user/following" ) {
		settings.gui.homepage = "/user/followedStreams";
	}

	// translate old quality ID setting
	qualityIdToName( settings.streaming );

	// remove unused or disabled streams language filters
	if ( typeof settings.streams.languages === "object" ) {
		for ( const [ code ] of Object.entries( settings.streams.languages ) ) {
			const lang = langs[ code ];
			if ( !lang || lang.disabled ) {
				delete settings.streams.languages[ code ];
			}
		}
	}

	// rename old notification provider names
	if ( [ "libnotify", "freedesktop" ].includes( settings.notification.provider ) ) {
		settings.notification.provider = "native";
	}

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
