define([
	"ember",
	"utils/preload",
	"models/Search"
], function( Ember, preload, ModelSearch ) {

	return Ember.Route.extend({
		model: function( params ) {
			this.set( "filter", params.filter );
			this.set(  "query",  params.query );

			return ModelSearch({
				filter: params.filter,
				 query: params.query
			})
				.then( preload(
					"games.@each.box.@each.large",
					"streams.@each.preview.@each.medium"
				) );
		},

		setupController: function( controller, model ) {
			controller.set( "model", model );
			controller.set( "filter", this.get( "filter" ) );
			controller.set(  "query", this.get(  "query" ) );
		}
	});

});
