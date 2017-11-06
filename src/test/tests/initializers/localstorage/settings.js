import {
	module,
	test
} from "qunit";
import updateSettingsInjector from "inject-loader?-./utils!initializers/localstorage/settings";


const { default: updateSettings } = updateSettingsInjector( {
	config: {
		players: {},
		langs: {
			de: {},
			en: {},
			fr: { disabled: true }
		}
	},
	"models/stream/qualities": [
		{ id: "source" },
		{ id: "high" }
	]
} );


module( "initializers/localstorage/settings" );


test( "Removes old attributes", assert => {

	const a = {
		livestreamer: "foo",
		livestreamer_params: "bar",
		qualities: {
			source: "foo",
			high: "bar",
			medium: "baz",
			low: "qux",
			audio: "quux"
		}
	};
	updateSettings( a );
	assert.propEqual(
		a,
		{
			gui: {},
			streaming: {},
			streams: {},
			notification: {}
		},
		"Removes all old and unused attributes"
	);

});


test( "Updates attributes", assert => {

	const oldRecyclableSettings = {
		livestreamer_oauth: true,
		gui_flagsvisible: true,
		gui_gamevisible: true,
		gui_streamclick_mid: 1,
		gui_streamclick_mod: 2
	};
	updateSettings( oldRecyclableSettings );
	assert.propEqual(
		oldRecyclableSettings,
		{
			gui: {},
			streaming: {
				oauth: true
			},
			streams: {
				show_flag: true,
				show_info: true,
				click_middle: 1,
				click_modify: 2
			},
			notification: {}
		},
		"Updates attributes and creates fragments if necessary"
	);

	const guiSettings = {
		gui_externalcommands: true,
		gui_focusrefresh: 300000,
		gui_homepage: "/user/followedStreams",
		gui_integration: 3,
		gui_minimize: 0,
		gui_minimizetotray: false,
		gui_smoothscroll: true,
		gui_theme: "default"
	};
	updateSettings( guiSettings );
	assert.propEqual(
		guiSettings,
		{
			gui: {
				externalcommands: true,
				focusrefresh: 300000,
				homepage: "/user/followedStreams",
				integration: 3,
				minimize: 0,
				minimizetotray: false,
				smoothscroll: true,
				theme: "default"
			},
			streaming: {},
			streams: {},
			notification: {}
		},
		"Updates gui attributes and creates gui fragment if necessary"
	);

	const streamingSettings = {
		streamprovider: "streamlink",
		streamproviders: { foo: 1 },
		quality: "source",
		qualities: { bar: 2 },
		quality_presets: { baz: 3 },
		streamprovider_oauth: true,
		player_passthrough: "http",
		player_reconnect: true,
		player_no_close: false,
		hls_live_edge: 3,
		hls_segment_threads: 2,
		retry_open: 10,
		retry_streams: 1
	};
	updateSettings( streamingSettings );
	assert.propEqual(
		streamingSettings,
		{
			gui: {},
			streaming: {
				provider: "streamlink",
				providers: { foo: 1 },
				quality: "source",
				qualities: { bar: 2 },
				qualitiesOld: { baz: 3 },
				oauth: true,
				player_passthrough: "http",
				player_reconnect: true,
				player_no_close: false,
				hls_live_edge: 3,
				hls_segment_threads: 2,
				retry_open: 10,
				retry_streams: 1
			},
			streams: {},
			notification: {}
		},
		"Updates streaming attributes and creates streaming fragment if necessary"
	);

	const streamsSettings = {
		channel_name: 3,
		gui_closestreampopup: false,
		gui_hidestreampopup: true,
		gui_openchat: false,
		gui_openchat_context: false,
		gui_twitchemotes: false,
		gui_vodcastfilter: true,
		gui_filterstreams: true,
		gui_langfilter: {
			de: true,
			en: true
		},
		stream_show_flag: false,
		stream_show_info: false,
		stream_info: 1,
		stream_click_middle: 2,
		stream_click_modify: 4
	};
	updateSettings( streamsSettings );
	assert.propEqual(
		streamsSettings,
		{
			gui: {},
			streaming: {},
			streams: {
				name: 3,
				modal_close_end: false,
				modal_close_launch: true,
				chat_open: false,
				chat_open_context: false,
				twitchemotes: false,
				filter_vodcast: true,
				filter_languages: true,
				languages: {
					de: true,
					en: true
				},
				show_flag: false,
				show_info: false,
				info: 1,
				click_middle: 2,
				click_modify: 4
			},
			notification: {}
		},
		"Updates streams attributes and creates streams fragment if necessary"
	);

	const notificationSettings = {
		notify_enabled: true,
		notify_provider: "native",
		notify_all: true,
		notify_grouping: true,
		notify_click: 2,
		notify_click_group: 1,
		notify_click_restore: true,
		notify_badgelabel: false
	};
	updateSettings( notificationSettings );
	assert.propEqual(
		notificationSettings,
		{
			gui: {},
			streaming: {},
			streams: {},
			notification: {
				enabled: true,
				provider: "native",
				filter: true,
				grouping: true,
				click: 2,
				click_group: 1,
				click_restore: true,
				badgelabel: false
			}
		},
		"Updates notification attributes and creates notification fragment if necessary"
	);

});


test( "Fixes attributes", assert => {

	const a = {
		gui: {
			minimize: false,
			minimizetotray: 1,
			homepage: "/user/following"
		},
		streaming: {
			quality: 1
		},
		streams: {
			languages: {
				de: true,
				en: false,
				fr: true,
				nl: true
			}
		},
		notification: {
			provider: "freedesktop"
		},
		player: "foo",
		player_params: "bar"
	};
	updateSettings( a );
	assert.propEqual(
		a,
		{
			gui: {
				minimize: 0,
				minimizetotray: true,
				homepage: "/user/followedStreams"
			},
			streaming: {
				quality: "high",
				player: "default",
				players: {
					"default": {
						exec: "foo",
						args: "bar"
					}
				}
			},
			streams: {
				languages: {
					de: true,
					en: false
				}
			},
			notification: {
				provider: "native"
			}
		},
		"Removes all old and unused attributes"
	);

	const b = {
		player: {
			foo: {
				params: {
					foo: "foo",
					bar: "bar"
				}
			}
		},
		player_preset: "foo"
	};
	updateSettings( b );
	assert.propEqual(
		b,
		{
			gui: {},
			streaming: {
				player: "foo",
				players: {
					foo: {
						exec: null,
						args: null,
						foo: "foo",
						bar: "bar"
					}
				}
			},
			streams: {},
			notification: {}
		},
		"Fixes old player preset structure"
	);

});
