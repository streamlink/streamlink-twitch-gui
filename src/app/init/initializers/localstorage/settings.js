import { langs as langsConfig } from "config";
import { moveAttributes, moveAttributesIntoFragment, qualityIdToName } from "./utils";
import { typeKey as streamingPlayerTypeKey } from "data/models/settings/streaming/player/fragment";
import { qualities } from "data/models/stream/model";
import { isWin7 } from "utils/node/platform";
import { streaming as streamingConfig } from "config";


const { hasOwnProperty } = {};

const { "default-provider": defaultProvider } = streamingConfig;


function removeOldData( settings ) {
	// remove old qualities setting (pre-exclusion streamlink/livestreamer quality selection)
	if ( typeof settings.qualities === "object" && typeof settings.qualities.source === "string" ) {
		delete settings[ "qualities" ];
	}
	if ( typeof settings.streaming === "object" ) {
		const { streaming } = settings;
		// remove livestreamer streaming providers
		if ( typeof streaming.providers === "object" ) {
			const { providers } = streaming;
			for ( const key of Object.keys( providers ) ) {
				if ( /^livestreamer/.test( key ) ) {
					delete providers[ key ];
				}
			}
		}
		// remove old backported livestreamer qualities
		if ( typeof streaming.qualitiesOld === "object" ) {
			delete streaming.qualitiesOld;
		}
		// remove old attributes
		delete streaming[ "oauth" ];
	}

	// remove old livestreamer data
	delete settings[ "livestreamer" ];
	delete settings[ "livestreamer_params" ];
	delete settings[ "quality_presets" ];

	// remove old streaming data
	delete settings[ "player_passthrough" ];
	delete settings[ "player_reconnect" ];

	// remove old chat data
	delete settings[ "chat_command" ];
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
		streamprovider_oauth: "oauth",
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

	// use new "chat" model fragment
	moveAttributesIntoFragment( settings, "chat", {
		chat_method: "provider"
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
	const { gui, streaming, streams, chat, notification } = settings;

	// fix old gui related attribute values
	if ( hasOwnProperty.call( gui, "minimize" ) && typeof gui.minimize !== "number" ) {
		gui.minimize = 0;
	}
	if ( hasOwnProperty.call( gui, "minimizetotray" ) && typeof gui.minimizetotray !== "boolean" ) {
		gui.minimizetotray = !!gui.minimizetotray;
	}
	if ( hasOwnProperty.call( gui, "homepage" ) ) {
		if ( gui.homepage === "/featured" ) {
			gui.homepage = "/streams";
		} else if (
			   gui.homepage === "/user/following"
			|| gui.homepage === "/user/subscriptions"
			|| gui.homepage === "/user/hostedStreams"
			|| /^\/user\/followedGames($|\/.*)/.test( gui.homepage )
		) {
			gui.homepage = "/user/followedStreams";
		} else if ( /^\/communities($|\/.*)/.test( gui.homepage ) ) {
			gui.homepage = "/";
		}
	}
	if ( gui.theme === "default" ) {
		gui.theme = "system";
	}

	// fix streaming provider selection
	if ( /^livestreamer/.test( streaming.provider ) ) {
		streaming.provider = defaultProvider;
	}

	// translate old quality ID setting
	qualityIdToName( streaming, qualities );

	// translate old streaming providers data
	if ( typeof streaming[ "providers" ] === "object" ) {
		const { provider, providers } = streaming;
		if ( hasOwnProperty.call( providers, "streamlinkw" ) ) {
			providers[ "streamlink-python" ] = providers[ "streamlink" ];
			providers[ "streamlink" ] = providers[ "streamlinkw" ];
			delete providers[ "streamlinkw" ];
		}
		if ( provider === "streamlinkw" ) {
			streaming.provider = "streamlink";
		}
	}

	if ( hasOwnProperty.call( streaming, "hls_segment_threads" ) ) {
		streaming[ "stream_segment_threads" ] = streaming[ "hls_segment_threads" ];
		delete streaming[ "hls_segment_threads" ];
	}

	// translate old players data
	fixStreamingPlayers( streaming, settings );

	// fix old chat data
	if (
		   hasOwnProperty.call( chat, "provider" )
		&& [ "default", "msie" ].includes( chat.provider )
	) {
		chat.provider = "browser";
	}

	// update old language filter
	if ( hasOwnProperty.call( streams, "filter_languages" ) ) {
		const value = streams.filter_languages;
		// can't translate null or false value here due to lack of schema version
		streams.languages_fade = value === 1;
		streams.languages_filter = value === 2 || value === true;
		delete streams.filter_languages;
	}
	// find single language selection and update the new old languages object
	if ( hasOwnProperty.call( streams, "language" ) ) {
		const language = streams.language;
		streams.languages = Object.entries( langsConfig )
			.reduce( ( obj, [ key, { disabled } ] ) => {
				if ( !disabled ) {
					obj[ key ] = key === language;
				}
				return obj;
			}, {} );
		delete streams.language;
	}

	// rename old notification provider names
	if ( [ "libnotify", "freedesktop" ].includes( notification.provider ) ) {
		notification.provider = "native";
	} else if ( !isWin7 && notification.provider === "rich" ) {
		notification.provider = "auto";
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
			if ( name !== "default" ) {
				player[ streamingPlayerTypeKey ] = `settings-streaming-player-${name}`;
			}
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
