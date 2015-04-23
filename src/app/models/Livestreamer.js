define([
	"ember",
	"ember-data",
	"utils/Parameter",
	"utils/Substitution"
], function( Ember, DS, Parameter, Substitution ) {

	var get = Ember.get,
	    set = Ember.set;

	/**
	 * @class Livestreamer
	 */
	return DS.Model.extend({
		stream      : DS.belongsTo( "twitchStream" ),
		channel     : DS.belongsTo( "twitchChannel" ),
		quality     : DS.attr( "number" ),
		gui_openchat: DS.attr( "boolean" ),
		started     : DS.attr( "date" ),


		/** @property {ChildProcess} spawn */
		spawn  : null,
		success: false,
		error  : false,


		init: function() {
			this._super.apply( this, arguments );
			set( this, "auth",     this.container.lookup( "record:auth" ) );
			set( this, "settings", this.container.lookup( "record:settings" ) );
		},

		kill: function() {
			if ( this.spawn ) {
				this.spawn.kill( "SIGTERM" );
			}
		},

		qualityObserver: function() {
			// The LivestreamerController knows that it has to spawn a new child process
			if ( get( this, "success" ) ) {
				this.kill();
			}
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
			new Parameter( "--no-version-check" ),
			new Parameter( "--player", null, "settings.player", true ),
			new Parameter( "--player-args", "settings.player", "settings.player_params", true ),
			new Parameter( "--player-passthrough", null, "settings.player_passthrough" ),
			new Parameter( "--player-continuous-http", function() {
				return "http" === get( this, "settings.player_passthrough" )
				    &&          !!get( this, "settings.player_reconnect" );
			}),
			new Parameter( "--player-no-close", "settings.player_no_close" ),
			new Parameter( "--twitch-oauth-token", "auth.isLoggedIn", "auth.access_token" )
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
