define( [ "ember" ], function( Ember ) {

	return Ember.Object.extend({
		/** @type {ChildProcess} spawn */
		spawn  : null,
		stream : null,
		quality: null,
		started: undefined,

		nameBinding       : "stream.channel.name",
		displayNameBinding: "stream.channel.display_name",
		statusBinding     : "stream.channel.status",

		/** @type {(TwitchUserSubscription|boolean)} _subscribed */
		_subscribed      : false,
		subscribed       : Ember.computed.bool( "_subscribed" ),

		/** @type {(TwitchUserFollowsChannel|boolean)} _following */
		_following       : null,
		following        : Ember.computed.bool( "_following" ),
		following_loading: Ember.computed.equal( "_following", null ),
		following_lock   : false,


		init: function() {
			this.started = new Date();
		},

		kill: function() {
			if ( this.spawn ) {
				this.spawn.kill( "SIGTERM" );
			}
		},

		qualityObserver: function() {
			// The LivestreamerController knows that it has to spawn a new child process
			this.kill();
		}.observes( "quality" )

	}).reopenClass({
		toString: function() { return "Livestreamer"; }
	});

});
