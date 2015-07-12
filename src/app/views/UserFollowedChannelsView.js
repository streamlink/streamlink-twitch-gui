define([
	"Ember",
	"mixins/InfiniteScrollViewMixin",
	"text!templates/user/followedchannels.html.hbs"
], function( Ember, InfiniteScrollViewMixin, template ) {

	return Ember.View.extend( InfiniteScrollViewMixin, {
		template: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-user", "content-user-followed-channels" ]
	});

});
