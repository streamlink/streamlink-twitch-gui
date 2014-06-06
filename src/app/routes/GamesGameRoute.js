define([
	"ember",
	"routes/InfiniteScrollRouteMixin",
	"utils/preload",
	"models/Streams"
], function( Ember, InfiniteScroll, preload, ModelStreams ) {

	return Ember.Route.extend( InfiniteScroll, {
		model: function( params ) {
			params = params || {};
			if ( params.game ) {
				Ember.set( this, "game", params.game );
			}

			return ModelStreams({
				game	: Ember.get( this, "game" ),
				offset	: Ember.get( this, "offset" ),
				limit	: Ember.get( this, "limit" )
			})
				.then(function( data ) {
					return Ember.getWithDefault( data, "streams", [] );
				})
				.then( preload( "@each.preview.@each.medium" ) );
		},

		setupController: function( controller, model ) {
			this._super.apply( this, arguments );

			controller.set( "model", model );
			controller.set( "game", Ember.get( this, "game" ) );
		}
	});

});
