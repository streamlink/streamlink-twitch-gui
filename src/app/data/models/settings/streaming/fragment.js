import { computed } from "@ember/object";
import { equal } from "@ember/object/computed";
import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";
import { streaming as streamingConfig } from "config";
import { fragment } from "utils/decorators";


const { providers, "default-provider": defaultProvider } = streamingConfig;
const { MAX_SAFE_INTEGER: MAX } = Number;


export const ATTR_STREAMING_PLAYER_INPUT_STDIN = "stdin";
export const ATTR_STREAMING_PLAYER_INPUT_FIFO = "fifo";
export const ATTR_STREAMING_PLAYER_INPUT_HTTP = "http";
export const ATTR_STREAMING_PLAYER_INPUT_PASSTHROUGH = "passthrough";


export default class SettingsStreaming extends Fragment {
	static playerInput = [
		{
			id: ATTR_STREAMING_PLAYER_INPUT_STDIN,
			documentation: null
		},
		{
			id: ATTR_STREAMING_PLAYER_INPUT_FIFO,
			documentation: "--player-fifo"
		},
		{
			id: ATTR_STREAMING_PLAYER_INPUT_HTTP,
			documentation: "--player-continuous-http"
		},
		{
			id: ATTR_STREAMING_PLAYER_INPUT_PASSTHROUGH,
			documentation: "--player-passthrough"
		}
	];

	@attr( "string", { defaultValue: defaultProvider } )
	provider;
	/** @type {SettingsStreamingProviders} */
	@fragment( "settings-streaming-providers" )
	providers;

	@attr( "string", { defaultValue: "source" } )
	quality;
	/** @type {SettingsStreamingQualities} */
	@fragment( "settings-streaming-qualities" )
	qualities;

	@attr( "string", { defaultValue: "default" } )
	player;
	/** @type {SettingsStreamingPlayers} */
	@fragment( "settings-streaming-players" )
	players;

	@attr( "boolean", { defaultValue: false } )
	low_latency;
	@attr( "boolean", { defaultValue: false } )
	disable_ads;
	@attr( "string", { defaultValue: ATTR_STREAMING_PLAYER_INPUT_STDIN } )
	player_input;
	@attr( "boolean", { defaultValue: false } )
	player_no_close;
	@attr( "number", { defaultValue: 3, min: 1, max: 10 } )
	hls_live_edge;
	@attr( "number", { defaultValue: 1, min: 1, max: 10 } )
	hls_segment_threads;
	@attr( "number", { defaultValue: 1, min: 1, max: MAX } )
	retry_open;
	@attr( "number", { defaultValue: 1, min: 0, max: MAX } )
	retry_streams;


	@computed( "provider" )
	get providerName() {
		return providers[ this.provider ][ "name" ];
	}

	@computed( "provider" )
	get providerType() {
		return providers[ this.provider ][ "type" ];
	}

	@equal( "providerType", "streamlink" )
	isStreamlink;
}
