define( [ "ember", "models/Streams", "utils/preload" ], function( Ember, Model, preload ) {

	return Ember.Route.extend({
		model: function( params ) {
			this.set( "game", params.game );

			return preload(
				Model({
					game: params.game
				}),
				function( res ) {
					return Object.create( res.streams ).map(function( stream ) {
						return stream.preview;
					});
				}
			);
		},

		setupController: function( controller, model ) {
			controller.set( "model", model );
			controller.set( "game", this.get( "game" ) );
		}
	});

});
