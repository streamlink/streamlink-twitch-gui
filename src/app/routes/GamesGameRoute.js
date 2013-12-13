define( [ "ember", "models/Streams" ], function( Ember, Model ) {

	return Ember.Route.extend({
		model: function( params ) {
			this.set( "game", params.game );

			return Model({
				game: params.game
			});
		},

		setupController: function( controller, model ) {
			controller.set( "model", model );
			controller.set( "game", this.get( "game" ) );
		}
	});

});
