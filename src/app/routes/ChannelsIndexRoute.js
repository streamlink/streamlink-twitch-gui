define([
	"ember",
	"routes/InfiniteScrollRouteMixin",
	"utils/preload"
], function( Ember, InfiniteScroll, preload ) {

	return Ember.Route.extend( InfiniteScroll, {
		itemSelector: ".stream-component",
		itemHeight: 207,

		model: function() {
			return this.store.findQuery( "twitchStream", {
				offset	: Ember.get( this, "offset" ),
				limit	: Ember.get( this, "limit" )
			})
				.then(function( data ) { return data.toArray(); })
				.then( preload( "@each.preview.@each.medium" ) );
		}
	});

});
