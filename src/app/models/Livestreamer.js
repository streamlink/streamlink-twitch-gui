define( [ "ember" ], function( Ember ) {

	return Ember.Object.extend({
		/** @type {ChildProcess} spawn */
		spawn  : null,
		stream : null,
		channel: null,
		quality: null,
		success: false,
		error  : false,
		started: undefined,


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
