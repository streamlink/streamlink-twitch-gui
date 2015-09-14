define([
	"Ember",
	"mixins/InfiniteScrollMixin",
	"mixins/LanguageFilterMixin",
	"mixins/ModelMetadataMixin",
	"utils/preload"
], function(
	Ember,
	InfiniteScrollMixin,
	LanguageFilterMixin,
	ModelMetadataMixin,
	preload
) {

	var get = Ember.get;

	return Ember.Route.extend( InfiniteScrollMixin, LanguageFilterMixin, ModelMetadataMixin, {
		itemSelector: ".stream-component",

		modelName: "twitchStream",

		model: function() {
			return get( this, "store" ).query( this.modelName, {
				offset              : get( this, "offset" ),
				limit               : get( this, "limit" ),
				broadcaster_language: get( this, "broadcaster_language" )
			})
				.then(function( data ) { return data.toArray(); })
				.then( preload( "preview.medium_nocache" ) );
		}
	});

});
