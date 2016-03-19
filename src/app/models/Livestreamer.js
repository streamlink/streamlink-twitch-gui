define([
	"Ember",
	"EmberData",
	"utils/Parameter",
	"utils/ParameterCustom",
	"utils/Substitution"
], function(
	Ember,
	DS,
	Parameter,
	ParameterCustom,
	Substitution
) {

	var get = Ember.get;
	var set = Ember.set;
	var attr = DS.attr;
	var belongsTo = DS.belongsTo;
	var alias = Ember.computed.alias;

	/**
	 * @class Livestreamer
	 */
	return DS.Model.extend({
		stream      : belongsTo( "twitchStream", { async: false } ),
		channel     : belongsTo( "twitchChannel", { async: false } ),
		quality     : attr( "number" ),
		gui_openchat: attr( "boolean" ),
		started     : attr( "date" ),


		/** @property {ChildProcess} spawn */
		spawn  : null,
		success: false,
		error  : false,
		warning: false,
		log    : null,
		showLog: false,


		auth    : Ember.inject.service(),
		settings: Ember.inject.service(),

		session: alias( "auth.session" ),


		kill: function() {
			var spawn = get( this, "spawn" );
			if ( spawn ) {
				spawn.kill( "SIGTERM" );
			}
		},

		clearLog: function() {
			return set( this, "log", [] );
		},

		pushLog: function( type, line ) {
			get( this, "log" ).pushObject({
				type: type,
				line: line
			});
		},

		qualityObserver: function() {
			// The LivestreamerController knows that it has to spawn a new child process
			this.kill();
		}.observes( "quality" ),

		parameters: function() {
			var isAdvanced = get( this, "settings.advanced" );

			return Parameter.getParameters(
				this,
				this.constructor.parameters,
				isAdvanced && this.constructor.substitutions
			);
		}.property().volatile()

	}).reopenClass({

		toString: function() { return "Livestreamer"; },

		/** @property {Parameter[]} parameters */
		parameters: [
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
				true
			),
			new Parameter(
				"--player-args",
				[ "settings.advanced", "settings.player" ],
				"settings.player_params",
				true
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
				"settings.advanced",
				"settings.retry_open"
			),
			new Parameter(
				"--retry-streams",
				"settings.advanced",
				"settings.retry_streams"
			)
		],

		/** @property {Substitution[]} substitutions */
		substitutions: [
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
		]

	});

});
