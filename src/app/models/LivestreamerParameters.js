define([
	"Ember",
	"utils/Parameter",
	"utils/ParameterCustom",
	"utils/Substitution"
], function(
	Ember,
	Parameter,
	ParameterCustom,
	Substitution
) {

	var get = Ember.get;


	/** @type {Substitution[]} */
	var playerSubstitutions = [
		new Substitution(
			[ "name", "channel", "channelname" ],
			"channel.display_name",
			"Channel name"
		),
		new Substitution(
			[ "status", "title" ],
			"channel.status",
			"Channel status text"
		),
		new Substitution(
			[ "game", "gamename" ],
			"stream.game",
			"Name of the game being played"
		),
		new Substitution(
			"delay",
			"channel.delay",
			"Additional stream delay in seconds"
		),
		new Substitution(
			[ "online", "since", "created" ],
			"stream.created_at",
			"Online since"
		),
		new Substitution(
			[ "viewers", "current" ],
			"stream.viewers",
			"Number of current viewers"
		),
		new Substitution(
			[ "views", "overall" ],
			"channel.views",
			"Total number of views"
		)
	];


	/** @type {Parameter[]} */
	var parameters = [
		new ParameterCustom(
			"settings.advanced",
			"settings.livestreamer_params"
		),
		new Parameter(
			"--no-version-check"
		),
		new Parameter(
			"--player",
			null,
			"settings.player",
			playerSubstitutions
		),
		new Parameter(
			"--player-args",
			[ "settings.advanced", "settings.player" ],
			"settings.playerParamsCorrected",
			playerSubstitutions
		),
		new Parameter(
			"--player-passthrough",
			"settings.advanced",
			"settings.player_passthrough"
		),
		new Parameter(
			"--player-continuous-http",
			[
				"settings.player_reconnect",
				function() {
					return get( this, "settings.player_passthrough" ) === "http";
				}
			]
		),
		new Parameter(
			"--player-no-close",
			"settings.player_no_close"
		),
		new Parameter(
			"--twitch-oauth-token",
			"session.isLoggedIn",
			"session.access_token"
		),
		new Parameter(
			"--hls-live-edge",
			"settings.advanced",
			"settings.hls_live_edge"
		),
		new Parameter(
			"--hls-segment-threads",
			"settings.advanced",
			"settings.hls_segment_threads"
		),
		new Parameter(
			"--retry-open",
			null,
			"settings.retry_open"
		),
		new Parameter(
			"--retry-streams",
			null,
			"settings.retry_streams"
		)
	];


	return {
		parameters: parameters,
		playerSubstitutions: playerSubstitutions
	};

});
