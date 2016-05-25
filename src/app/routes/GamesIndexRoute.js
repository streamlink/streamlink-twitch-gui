define([
	"Ember",
	"mixins/InfiniteScrollMixin",
	"mixins/ModelMetadataMixin",
	"utils/ember/toArray",
	"utils/preload"
], function(
	Ember,
	InfiniteScrollMixin,
	ModelMetadataMixin,
	toArray,
	preload
) {

	var get = Ember.get;


	return Ember.Route.extend( InfiniteScrollMixin, ModelMetadataMixin, {
		itemSelector: ".game-item-component",

		modelName: "twitchGamesTop",

		model: function() {
			return get( this, "store" ).query( this.modelName, {
				offset: get( this, "offset" ),
				limit : get( this, "limit" )
			})
				.then( toArray )
				.then( preload( "game.box.large" ) );
		}
	});

});
