define([
	"ember",
	"views/InfiniteScrollViewMixin",
	"text!templates/user/following.html.hbs"
], function( Ember, InfiniteScroll, Template ) {

	return Ember.View.extend( InfiniteScroll, {
		template: Ember.Handlebars.compile( Template ),
		tagName: "main",
		classNames: [ "content", "content-user", "content-user-following" ]
	});

});
