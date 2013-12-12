define( [ "ember", "models/Streams" ], function( Ember, Model ) {

	return Ember.Route.extend({
		model: function() {
			return Model();
		},

		/**
		 * @param {Ember.ObjectController} controller
		 * @param {TwitchStreams} streams
		 */
		setupController: function( controller, streams ) {
			controller.set( "streams", streams.streams.map(function( stream ) {
				stream.livestreamer = "require('child_process').spawn('livestreamer',['" + stream.channel.url + "','best'])";
				return stream;
			}));
		}
	});

});
