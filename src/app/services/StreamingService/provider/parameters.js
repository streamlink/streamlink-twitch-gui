import { get } from "ember";
import playerSubstitutions from "services/StreamingService/player/substitutions";
import Parameter from "utils/parameters/Parameter";
import ParameterCustom from "utils/parameters/ParameterCustom";


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
		"--player-passthrough",
		"stream.settings.advanced",
		"stream.settings.player_passthrough"
	),
	new Parameter(
		"--player-continuous-http",
		[
			"stream.settings.player_reconnect",
			function() {
				return get( this, "stream.settings.player_passthrough" ) === "http";
			}
		]
	),
	new Parameter(
		"--player-no-close",
		"stream.settings.player_no_close"
	),
	new Parameter(
		"--twitch-oauth-token",
		[
			"stream.session.isLoggedIn",
			"stream.settings.streamprovider_oauth"
		],
		"stream.session.access_token"
	),
	new Parameter(
		"--hls-live-edge",
		"stream.settings.advanced",
		"stream.settings.hls_live_edge"
	),
	new Parameter(
		"--hls-segment-threads",
		"stream.settings.advanced",
		"stream.settings.hls_segment_threads"
	),
	new Parameter(
		"--retry-open",
		null,
		"stream.settings.retry_open"
	),
	new Parameter(
		"--retry-streams",
		null,
		"stream.settings.retry_streams"
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
