define([
	"ember",
	"views/InfiniteScrollViewMixin",
	"text!templates/channels/index.html.hbs"
], function( Ember, InfiniteScroll, Template ) {

	return Ember.View.extend( InfiniteScroll, {
		template: Ember.Handlebars.compile( Template ),
		tagName: "main",
		classNames: [ "content", "content-channels" ]
	});

});
