define([
	"Ember",
	"routes/UserIndexRoute",
	"mixins/InfiniteScrollMixin",
	"mixins/ModelMetadataMixin",
	"utils/ember/toArray",
	"utils/ember/mapBy",
	"utils/preload"
], function(
	Ember,
	UserIndexRoute,
	InfiniteScrollMixin,
	ModelMetadataMixin,
	toArray,
	mapBy,
	preload
) {

	var get = Ember.get;


	return UserIndexRoute.extend( InfiniteScrollMixin, ModelMetadataMixin, {
		itemSelector: ".stream-item-component",

		modelName: "twitchStreamsFollowed",

		model: function() {
			return get( this, "store" ).query( this.modelName, {
				offset: get( this, "offset" ),
				limit : get( this, "limit" )
			})
				.then( toArray )
				.then( mapBy( "stream" ) )
				.then( preload( "preview.medium_nocache" ) );
		}
	});

});
