define([
	"Ember",
	"mixins/InfiniteScrollViewMixin",
	"text!templates/channels.html.hbs"
], function( Ember, InfiniteScrollViewMixin, template ) {

	return Ember.View.extend( InfiniteScrollViewMixin, {
		template: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-channels" ]
	});

});
