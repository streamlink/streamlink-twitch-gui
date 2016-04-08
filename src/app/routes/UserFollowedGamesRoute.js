define([
	"Ember",
	"routes/UserIndexRoute",
	"mixins/InfiniteScrollMixin",
	"mixins/ModelMetadataMixin",
	"utils/ember/toArray",
	"utils/preload"
], function(
	Ember,
	UserIndexRoute,
	InfiniteScrollMixin,
	ModelMetadataMixin,
	toArray,
	preload
) {

	var get = Ember.get;


	return UserIndexRoute.extend( InfiniteScrollMixin, ModelMetadataMixin, {
		itemSelector: ".game-item-component",

		modelName: "twitchGamesFollowed",

		model: function() {
			return get( this, "store" ).query( this.modelName, {
				offset: get( this, "offset" ),
				limit : get( this, "limit" )
			})
				.then( toArray )
				.then( preload( "box.large" ) );
		}
	});

});
