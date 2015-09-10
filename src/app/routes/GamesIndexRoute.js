define([
	"Ember",
	"mixins/InfiniteScrollMixin",
	"mixins/ModelMetadataMixin",
	"utils/preload"
], function(
	Ember,
	InfiniteScrollMixin,
	ModelMetadataMixin,
	preload
) {

	var get = Ember.get;

	return Ember.Route.extend( InfiniteScrollMixin, ModelMetadataMixin, {
		itemSelector: ".game-component",

		modelName: "twitchGamesTop",

		model: function() {
			return get( this, "store" ).query( this.modelName, {
				offset: get( this, "offset" ),
				limit : get( this, "limit" )
			})
				.then(function( data ) { return data.toArray(); })
				.then( preload( "@each.game.@each.box.@each.large" ) );
		}
	});

});
