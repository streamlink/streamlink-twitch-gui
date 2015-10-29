define([
	"Ember",
	"routes/UserIndexRoute",
	"mixins/InfiniteScrollMixin",
	"mixins/ModelMetadataMixin",
	"utils/preload"
], function(
	Ember,
	UserIndexRoute,
	InfiniteScrollMixin,
	ModelMetadataMixin,
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
				.then(function( data ) {
					return data.mapBy( "stream" ).toArray();
				})
				.then( preload( "preview.medium_nocache" ) );
		}
	});

});
