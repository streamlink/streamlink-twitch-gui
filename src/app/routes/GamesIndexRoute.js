define([
	"Ember",
	"mixins/InfiniteScrollRouteMixin",
	"utils/preload"
], function( Ember, InfiniteScrollRouteMixin, preload ) {

	return Ember.Route.extend( InfiniteScrollRouteMixin, {
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
