define([
	"Ember",
	"mixins/InfiniteScrollRouteMixin",
	"mixins/LanguageFilterMixin",
	"utils/preload"
], function(
	Ember,
	InfiniteScrollRouteMixin,
	LanguageFilterMixin,
	preload
) {

	var get = Ember.get;

	return Ember.Route.extend( InfiniteScrollRouteMixin, LanguageFilterMixin, {
		itemSelector: ".stream-component",

		model: function() {
			return this.store.findQuery( "twitchStream", {
				offset              : get( this, "offset" ),
				limit               : get( this, "limit" ),
				broadcaster_language: get( this, "broadcaster_language" )
			})
				.then(function( data ) { return data.toArray(); })
				.then( preload( "@each.preview.@each.medium_nocache" ) );
		}
	});

});
