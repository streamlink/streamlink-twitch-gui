define([
	"ember",
	"views/InfiniteScrollViewMixin",
	"text!templates/search.html.hbs"
], function( Ember, InfiniteScroll, template ) {

	return Ember.View.extend( InfiniteScroll, {
		template: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-search" ]
	});

});
