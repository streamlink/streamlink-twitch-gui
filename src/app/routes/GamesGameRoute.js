define([
	"ember",
	"utils/preload",
	"models/Streams"
], function( Ember, preload, ModelStreams ) {

	return Ember.Route.extend({
		model: function( params ) {
			this.set( "game", params.game );

			return ModelStreams({
				game: params.game
			})
				.then( preload( "streams.@each.preview" ) );
		},

		setupController: function( controller, model ) {
			controller.set( "model", model );
			controller.set( "game", this.get( "game" ) );
		}
	});

});
