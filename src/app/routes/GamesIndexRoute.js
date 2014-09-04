define([
	"ember",
	"routes/InfiniteScrollRouteMixin",
	"utils/preload"
], function( Ember, InfiniteScroll, preload ) {

	return Ember.Route.extend( InfiniteScroll, {
		itemSelector: ".game-component",

		model: function() {
			return this.store.findQuery( "twitchGamesTop", {
				offset	: Ember.get( this, "offset" ),
				limit	: Ember.get( this, "limit" )
			})
				.then(function( data ) { return data.toArray(); })
				.then( preload( "@each.game.@each.box.@each.large" ) );
		}
	});

});
