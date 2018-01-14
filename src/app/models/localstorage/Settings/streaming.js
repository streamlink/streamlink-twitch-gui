import { get, computed } from "@ember/object";
import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";
import { fragment } from "ember-data-model-fragments/attributes";
import { streaming as streamingConfig } from "config";


const { equal } = computed;
const { providers } = streamingConfig;
const { MAX_SAFE_INTEGER: MAX } = Number;


export const ATTR_STREAMING_PLAYER_INPUT_STDIN = "stdin";
export const ATTR_STREAMING_PLAYER_INPUT_FIFO = "fifo";
export const ATTR_STREAMING_PLAYER_INPUT_HTTP = "http";
export const ATTR_STREAMING_PLAYER_INPUT_PASSTHROUGH = "passthrough";


export default Fragment.extend({
	provider: attr( "string", { defaultValue: "streamlink" } ),
	providers: fragment( "settingsStreamingProviders", { defaultValue: {} } ),

	quality: attr( "string", { defaultValue: "source" } ),
	qualities: fragment( "settingsStreamingQualities", { defaultValue: {} } ),
	qualitiesOld: fragment( "settingsStreamingQualitiesOld", { defaultValue: {} } ),

	player: attr( "string", { defaultValue: "default" } ),
	players: fragment( "settingsStreamingPlayers", { defaultValue: {} } ),

	oauth: attr( "boolean", { defaultValue: true } ),
	player_input: attr( "string", { defaultValue: ATTR_STREAMING_PLAYER_INPUT_STDIN } ),
	player_no_close: attr( "boolean", { defaultValue: false } ),
	hls_live_edge: attr( "number", { defaultValue: 3, min: 1, max: 10 } ),
	hls_segment_threads: attr( "number", { defaultValue: 1, min: 1, max: 10 } ),
	retry_open: attr( "number", { defaultValue: 1, min: 1, max: MAX } ),
	retry_streams: attr( "number", { defaultValue: 1, min: 0, max: MAX } ),

	providerName: computed( "provider", function() {
		const provider = get( this, "provider" );
		return providers[ provider ][ "name" ];
	}),

	providerType: computed( "provider", function() {
		const provider = get( this, "provider" );
		return providers[ provider ][ "type" ];
	}),

	isStreamlink: equal( "providerType", "streamlink" )

}).reopenClass({

	playerInput: [
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
	]
});
