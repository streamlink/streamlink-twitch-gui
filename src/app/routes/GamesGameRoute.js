define( [ "ember", "models/Streams" ], function( Ember, Model ) {

	return Ember.Route.extend({
		model: function( params ) {
			this.set( "game", params.game );

			return Model({
				game: params.game
			});
		},

		/**
		 * @param {Ember.ObjectController} controller
		 * @param {TwitchStreams} streams
		 */
		setupController: function( controller, streams ) {
			controller.set( "game", this.get( "game" ) );
			controller.set( "streams", streams.streams );
		}
	});

});
