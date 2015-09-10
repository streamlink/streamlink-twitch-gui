define([
	"Ember",
	"mixins/InfiniteScrollMixin",
	"mixins/LanguageFilterMixin",
	"utils/preload"
], function(
	Ember,
	InfiniteScrollMixin,
	LanguageFilterMixin,
	preload
) {

	var get = Ember.get;

	return Ember.Route.extend( InfiniteScrollMixin, LanguageFilterMixin, {
		itemSelector: ".stream-component",

		model: function() {
			return get( this, "store" ).query( "twitchStream", {
				offset              : get( this, "offset" ),
				limit               : get( this, "limit" ),
				broadcaster_language: get( this, "broadcaster_language" )
			})
				.then(function( data ) { return data.toArray(); })
				.then( preload( "@each.preview.@each.medium_nocache" ) );
		}
	});

});
