import { get } from "@ember/object";
import playerSubstitutions from "../player/substitutions";
import Parameter from "utils/parameters/Parameter";
import ParameterCustom from "utils/parameters/ParameterCustom";
import {
	ATTR_STREAMING_PLAYER_INPUT_FIFO,
	ATTR_STREAMING_PLAYER_INPUT_HTTP,
	ATTR_STREAMING_PLAYER_INPUT_PASSTHROUGH
} from "data/models/settings/streaming/fragment";


function playerInput( attr ) {
	return function() {
		return get( this, "stream.settings.streaming.player_input" ) === attr;
	};
}


/** @type {Parameter[]} */
export const parameters = [
	new ParameterCustom(
		"stream.settings.advanced",
		"stream.customParameters"
	),
	new Parameter(
		"--http-header",
		null,
		"stream.clientID"
	),
	new Parameter(
		"--no-version-check"
	),
	new Parameter(
		"--twitch-disable-hosting",
		"stream.isStreamlink"
	),
	new Parameter(
		"--player",
		null,
		"player.exec",
		playerSubstitutions
	),
	new Parameter(
		"--player-args",
		null,
		"player.params",
		playerSubstitutions
	),
	new Parameter(
		"--player-fifo",
		playerInput( ATTR_STREAMING_PLAYER_INPUT_FIFO )
	),
	new Parameter(
		"--player-continuous-http",
		playerInput( ATTR_STREAMING_PLAYER_INPUT_HTTP )
	),
	new Parameter(
		"--player-passthrough",
		playerInput( ATTR_STREAMING_PLAYER_INPUT_PASSTHROUGH ),
		"stream.playerInputPassthrough"
	),
	new Parameter(
		"--player-no-close",
		"stream.settings.streaming.player_no_close"
	),
	new Parameter(
		"--twitch-oauth-token",
		[
			"stream.session.isLoggedIn",
			"stream.settings.streaming.oauth"
		],
		"stream.session.access_token"
	),
	new Parameter(
		"--hls-live-edge",
		"stream.settings.advanced",
		"stream.settings.streaming.hls_live_edge"
	),
	new Parameter(
		"--hls-segment-threads",
		"stream.settings.advanced",
		"stream.settings.streaming.hls_segment_threads"
	),
	new Parameter(
		"--retry-open",
		null,
		"stream.settings.streaming.retry_open"
	),
	new Parameter(
		"--retry-streams",
		null,
		"stream.settings.streaming.retry_streams"
	),
	new Parameter(
		"--stream-sorting-excludes",
		"stream.isStreamlink",
		"stream.streamQualitiesExclude"
	),
	new Parameter(
		null,
		null,
		"stream.streamUrl"
	),
	new Parameter(
		null,
		null,
		"stream.streamQuality"
	)
];
