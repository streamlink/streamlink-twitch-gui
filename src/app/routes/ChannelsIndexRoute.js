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
			controller.set( "streams", streams.streams );
		}
	});

});
