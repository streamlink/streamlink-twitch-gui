define( [ "ember" ], function( Ember ) {

	return Ember.Object.extend({
		/** @type {ChildProcess} spawn */
		spawn  : null,
		stream : null,
		quality: null,
		started: undefined,

		nameBinding       : "stream.channel.name",
		displayNameBinding: "stream.channel.display_name",
		urlBinding        : "stream.channel.url",
		statusBinding     : "stream.channel.status",


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
