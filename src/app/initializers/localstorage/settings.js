import {
	players as playersConfig,
	langs as langsConfig
} from "config";
import {
	moveAttributes,
	moveAttributesIntoFragment,
	qualityIdToName
} from "./utils";
import qualities from "models/stream/qualities";


const { hasOwnProperty } = {};


function removeOldData( settings ) {
	// remove old qualities setting (pre-exclusion streamlink/livestreamer quality selection)
	if ( typeof settings.qualities === "object" && typeof settings.qualities.source === "string" ) {
		delete settings[ "qualities" ];
	}

	// remove old livestreamer data
	delete settings[ "livestreamer" ];
	delete settings[ "livestreamer_params" ];
}


// TODO: remove this
function updatePlayerData( settings ) {
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
		Object.keys( playersConfig ).forEach(function( name ) {
			if ( !settings.player.hasOwnProperty( name ) ) {
				settings.player[ name ] = {
					"exec": "",
					"args": "",
					"params": {}
				};
			}
			const playerParams = settings.player[ name ].params;
			// iterate player preset params
			playersConfig[ name ].params.forEach(function( param ) {
				// don't overwrite already existing values
				if ( playerParams.hasOwnProperty( param.name ) ) { return; }
				playerParams[ param.name ] = param.default;
			});
		});
	}
}


function updateAttributes( settings ) {
	// move old attributes (will be overwritten by new attributes if they exist)
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
}


function fixAttributes( settings ) {
	const { gui, streaming, streams, notification } = settings;

	// fix old gui related attribute values
	if ( hasOwnProperty.call( gui, "minimize" ) && typeof gui.minimize !== "number" ) {
		gui.minimize = 0;
	}
	if ( hasOwnProperty.call( gui, "minimizetotray" ) && typeof gui.minimizetotray !== "boolean" ) {
		gui.minimizetotray = !!gui.minimizetotray;
	}
	if ( hasOwnProperty.call( gui, "homepage" ) && gui.homepage === "/user/following" ) {
		gui.homepage = "/user/followedStreams";
	}

	// translate old quality ID setting
	qualityIdToName( streaming, qualities );

	// remove unused or disabled streams language filters
	if ( typeof streams.languages === "object" ) {
		for ( const [ code ] of Object.entries( streams.languages ) ) {
			const lang = langsConfig[ code ];
			if ( !lang || lang.disabled ) {
				delete streams.languages[ code ];
			}
		}
	}

	// rename old notification provider names
	if ( [ "libnotify", "freedesktop" ].includes( notification.provider ) ) {
		notification.provider = "native";
	}
}


export default function( settings ) {
	removeOldData( settings );
	updatePlayerData( settings );
	updateAttributes( settings );
	fixAttributes( settings );
}
