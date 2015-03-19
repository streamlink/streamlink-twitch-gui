define([
	"ember",
	"views/InfiniteScrollViewMixin",
	"text!templates/games/game.html.hbs"
], function( Ember, InfiniteScroll, template ) {

	return Ember.View.extend( InfiniteScroll, {
		template: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-gamesgame" ]
	});

});
