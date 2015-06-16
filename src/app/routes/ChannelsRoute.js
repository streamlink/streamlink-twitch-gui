define([
	"Ember",
	"mixins/InfiniteScrollRouteMixin",
	"utils/preload"
], function( Ember, InfiniteScrollRouteMixin, preload ) {

	return Ember.Route.extend( InfiniteScrollRouteMixin, {
		itemSelector: ".stream-component",

		model: function() {
			return this.store.findQuery( "twitchStream", {
				offset	: Ember.get( this, "offset" ),
				limit	: Ember.get( this, "limit" )
			})
				.then(function( data ) { return data.toArray(); })
				.then( preload( "@each.preview.@each.medium_nocache" ) );
		}
	});

});
