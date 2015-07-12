define([
	"Ember",
	"mixins/InfiniteScrollRouteMixin",
	"utils/preload"
], function( Ember, InfiniteScrollRouteMixin, preload ) {

	var get = Ember.get;

	return Ember.Route.extend( InfiniteScrollRouteMixin, {
		itemSelector: ".game-component",

		model: function() {
			return this.store.findQuery( "twitchGamesTop", {
				offset: get( this, "offset" ),
				limit : get( this, "limit" )
			})
				.then(function( data ) { return data.toArray(); })
				.then( preload( "@each.game.@each.box.@each.large" ) );
		}
	});

});
