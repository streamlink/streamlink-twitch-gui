import {
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

	// translate old players data
	fixStreamingPlayers( streaming, settings );

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


function fixStreamingPlayers( streaming, settings ) {
	// translate old player data into the player presets format
	if ( typeof settings[ "player" ] === "string" ) {
		streaming.player = "default";
		streaming.players = streaming.players || {};
		if ( !hasOwnProperty.call( streaming.players, "default" ) ) {
			streaming.players[ "default" ] = {
				exec: settings[ "player" ] || null,
				args: settings[ "player_params" ] || null
			};
		}
		delete settings[ "player" ];
		delete settings[ "player_params" ];
	}

	// translate old player preset data into the new format
	if ( typeof settings[ "player" ] === "object" ) {
		const players = streaming.players = streaming.players || {};
		for ( const [ name, data ] of Object.entries( settings.player ) ) {
			const player = hasOwnProperty.call( players, name )
				? players[ name ]
				: ( players[ name ] = {} );
			player[ "exec" ] = data[ "exec" ] || null;
			player[ "args" ] = data[ "args" ] || null;
			for ( const [ key, value ] of Object.entries( data[ "params" ] || {} ) ) {
				player[ key ] = value;
			}
		}
		delete settings[ "player" ];
	}

	// translate old player preset selection
	if ( typeof settings[ "player_preset" ] === "string" ) {
		streaming.player = settings[ "player_preset" ];
		delete settings[ "player_preset" ];
	}
}


export default function( settings ) {
	removeOldData( settings );
	updateAttributes( settings );
	fixAttributes( settings );
}
